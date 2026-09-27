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

@Service
public class CompraLoteService {

    @Autowired private CompraLoteRepository compraLoteRepository;
    @Autowired private MaterialDisponivelRepository materialDisponivelRepository;
    @Autowired private DistribuidoraRepository distribuidoraRepository;
    @Autowired private EstoqueService estoqueService;

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
        montarItensEEntrarEstoque(compra, input, "Compra #" );
        CompraLote salva = compraLoteRepository.save(compra);
        // atualiza referência das movimentações com id real via save já feito
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
                    item.getMaterialDisponivel(),
                    item.getQuantidadeKg(),
                    item.getMetros(),
                    item.getBarras(),
                    "Estorno edição compra #" + id
            );
        }
        compra.getItens().clear();
        aplicarCabecalho(compra, input);
        montarItensEEntrarEstoque(compra, input, "Compra #" + id);
        return compraLoteRepository.save(compra);
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
                    item.getMaterialDisponivel(),
                    item.getQuantidadeKg(),
                    item.getMetros(),
                    item.getBarras(),
                    "Cancelamento compra #" + id
            );
        }
        compra.setStatus(StatusCompraLote.CANCELADA);
        compra.setMotivoCancelamento(motivo.trim());
        compra.setDataCancelamento(new Date());
        return compraLoteRepository.save(compra);
    }

    private void aplicarCabecalho(CompraLote compra, CompraLote input) {
        compra.setDataCompra(input.getDataCompra() != null ? input.getDataCompra() : new Date());
        compra.setNumeroNota(input.getNumeroNota());
        compra.setObservacao(input.getObservacao());
        if (input.getDistribuidora() != null && input.getDistribuidora().getId() != null) {
            compra.setDistribuidora(distribuidoraRepository.findById(input.getDistribuidora().getId())
                    .orElse(null));
        } else {
            compra.setDistribuidora(null);
        }
    }

    private void montarItensEEntrarEstoque(CompraLote compra, CompraLote input, String refPrefix) {
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

                BigDecimal kg = nz(itemIn.getQuantidadeKg());
                BigDecimal metros = nz(itemIn.getMetros());
                Integer barras = itemIn.getBarras() != null ? itemIn.getBarras() : 0;

                if (metros.signum() == 0 && barras > 0 && md.getComprimentoBarraMm() != null) {
                    metros = BigDecimal.valueOf(barras)
                            .multiply(BigDecimal.valueOf(md.getComprimentoBarraMm() / 1000.0))
                            .setScale(4, RoundingMode.HALF_UP);
                }
                if (kg.signum() == 0 && md.getPesoKgPorMetro() != null && metros.signum() > 0) {
                    kg = md.getPesoKgPorMetro().multiply(metros).setScale(4, RoundingMode.HALF_UP);
                }

                item.setQuantidadeKg(kg);
                item.setMetros(metros);
                item.setBarras(barras);
                item.setValorKg(nz(itemIn.getValorKg()));
                BigDecimal valorTotal = nz(itemIn.getValorTotal());
                if (valorTotal.signum() == 0 && item.getValorKg().signum() > 0 && kg.signum() > 0) {
                    valorTotal = item.getValorKg().multiply(kg).setScale(2, RoundingMode.HALF_UP);
                }
                item.setValorTotal(valorTotal);
                total = total.add(valorTotal);
                compra.getItens().add(item);

                String ref = compra.getId() != null ? refPrefix + compra.getId() : "Compra nova";
                estoqueService.entrarCompra(md, kg, metros, barras, ref);
            }
        }
        if (compra.getItens().isEmpty()) {
            throw new RegraNegocioException("Adicione ao menos um item na compra");
        }
        compra.setValorTotal(total);
    }

    private BigDecimal nz(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}
