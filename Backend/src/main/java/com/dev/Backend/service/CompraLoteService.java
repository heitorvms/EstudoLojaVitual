package com.dev.Backend.service;

import com.dev.Backend.entity.*;
import com.dev.Backend.exception.RegraNegocioException;
import com.dev.Backend.repository.CompraLoteRepository;
import com.dev.Backend.repository.DistribuidoraRepository;
import com.dev.Backend.repository.MaterialDisponivelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.List;

@Service
public class CompraLoteService {

    @Autowired private CompraLoteRepository compraLoteRepository;
    @Autowired private MaterialDisponivelRepository materialDisponivelRepository;
    @Autowired private DistribuidoraRepository distribuidoraRepository;
    @Autowired private EstoqueService estoqueService;
    @Autowired private OrdemServicoService ordemServicoService;
    @Autowired private CotacaoFinanceiroService financeiroService;

    public Page<CompraLote> listar(String query, Pageable pageable) {
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "dataCriacao")
        );
        return compraLoteRepository.search(query != null ? query.trim() : "", sorted);
    }

    public CompraLote buscar(Long id) {
        return compraLoteRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Compra não encontrada"));
    }

    @Transactional
    public CompraLote criar(CompraLote input) {
        CompraLote compra = new CompraLote();
        compra.setStatus(StatusCompraLote.ATIVA);
        compra.setDataCriacao(new Date());
        aplicarCabecalho(compra, input);
        compra = compraLoteRepository.save(compra);
        montarItensEEntrarEstoque(compra, input);
        CompraLote salva = compraLoteRepository.saveAndFlush(compra);
        financeiroService.sincronizarContasPagarDaCompra(salva, null);
        return salva;
    }

    @Transactional
    public CompraLote atualizar(Long id, CompraLote input) {
        CompraLote compra = buscar(id);
        if (compra.getStatus() == StatusCompraLote.CANCELADA) {
            throw new RegraNegocioException("Não é possível editar compra cancelada");
        }
        // Estorna estoque dos itens atuais
        for (CompraLoteItem item : compra.getItens()) {
            estoqueService.estornarCompra(
                    compra,
                    item.getMaterialDisponivel(),
                    item.getMetros(),
                    item.getBarras(),
                    "Estorno edição compra #" + id
            );
        }
        compra.getItens().clear();
        Long cotacaoAnterior = compra.getCotacaoId();
        aplicarCabecalho(compra, input);
        montarItensEEntrarEstoque(compra, input);
        CompraLote salva = compraLoteRepository.saveAndFlush(compra);
        ordemServicoService.validarCompraDeOsEmProducao(cotacaoAnterior);
        financeiroService.sincronizarContasPagarDaCompra(salva, cotacaoAnterior);
        return salva;
    }

    @Transactional
    public CompraLote cancelar(Long id, String motivo) {
        if (motivo == null || motivo.isBlank()) {
            throw new RegraNegocioException("Informe o motivo do cancelamento");
        }
        CompraLote compra = buscar(id);
        if (compra.getStatus() == StatusCompraLote.CANCELADA) {
            throw new RegraNegocioException("Compra já está cancelada");
        }
        for (CompraLoteItem item : compra.getItens()) {
            estoqueService.estornarCompra(
                    compra,
                    item.getMaterialDisponivel(),
                    item.getMetros(),
                    item.getBarras(),
                    "Cancelamento compra #" + id
            );
        }
        compra.setStatus(StatusCompraLote.CANCELADA);
        compra.setMotivoCancelamento(motivo.trim());
        compra.setDataCancelamento(new Date());
        CompraLote salva = compraLoteRepository.saveAndFlush(compra);
        ordemServicoService.validarCompraDeOsEmProducao(compra.getCotacaoId());
        financeiroService.sincronizarContasPagarDaCompra(salva, null);
        return salva;
    }

    private void aplicarCabecalho(CompraLote compra, CompraLote input) {
        compra.setDataCompra(input.getDataCompra() != null ? input.getDataCompra() : new Date());
        compra.setNumeroNota(input.getNumeroNota());
        compra.setObservacao(input.getObservacao());
        if (input.getCotacaoId() != null) {
            compra.setCotacaoId(input.getCotacaoId());
        }
    }

    private void montarItensEEntrarEstoque(CompraLote compra, CompraLote input) {
        BigDecimal total = BigDecimal.ZERO;
        if (input.getItens() != null) {
            for (CompraLoteItem itemIn : input.getItens()) {
                if (itemIn.getMaterialDisponivel() == null || itemIn.getMaterialDisponivel().getId() == null) {
                    throw new RegraNegocioException("Material obrigatório em cada item");
                }
                CompraLoteItem item = new CompraLoteItem();
                item.setCompraLote(compra);
                MaterialDisponivel md = materialDisponivelRepository.findById(itemIn.getMaterialDisponivel().getId())
                        .orElseThrow(() -> new RegraNegocioException("Material não encontrado"));
                item.setMaterialDisponivel(md);

                if (itemIn.getDistribuidora() == null || itemIn.getDistribuidora().getId() == null) {
                    throw new RegraNegocioException("Informe a distribuidora de " + md.getDescricao());
                }
                item.setDistribuidora(distribuidoraRepository.findById(itemIn.getDistribuidora().getId())
                        .orElseThrow(() -> new RegraNegocioException("Distribuidora não encontrada")));

                BigDecimal metros = nz(itemIn.getMetros());
                Integer barras = itemIn.getBarras() != null ? itemIn.getBarras() : 0;
                if (barras <= 0) {
                    throw new RegraNegocioException("Informe a quantidade de barras de cada item");
                }

                if (metros.signum() == 0) {
                    int barraMm = md.getComprimentoBarraMm() != null ? md.getComprimentoBarraMm() : 6000;
                    metros = BigDecimal.valueOf(barras)
                            .multiply(BigDecimal.valueOf(barraMm / 1000.0))
                            .setScale(4, RoundingMode.HALF_UP);
                }

                if (itemIn.getValorBarra() == null || itemIn.getValorBarra().signum() <= 0) {
                    throw new RegraNegocioException("Informe o valor da barra de " + md.getDescricao());
                }

                item.setMetros(metros);
                item.setBarras(barras);
                item.setValorBarra(itemIn.getValorBarra());
                BigDecimal valorTotal = item.getValorBarra().multiply(BigDecimal.valueOf(barras))
                        .setScale(2, RoundingMode.HALF_UP);
                item.setValorTotal(valorTotal);
                total = total.add(valorTotal);
                compra.getItens().add(item);

                estoqueService.entrarCompra(compra, md, metros, barras);
            }
        }
        if (compra.getItens().isEmpty()) {
            throw new RegraNegocioException("Adicione ao menos um item na compra");
        }
        compra.setValorTotal(total);
        compra.setDistribuidora(distribuidoraUnica(compra));
    }

    /** Com itens de fornecedores diferentes a compra não tem distribuidora principal. */
    private Distribuidora distribuidoraUnica(CompraLote compra) {
        List<Distribuidora> distintas = compra.getItens().stream()
                .map(CompraLoteItem::getDistribuidora)
                .distinct()
                .toList();
        return distintas.size() == 1 ? distintas.get(0) : null;
    }

    private BigDecimal nz(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}
