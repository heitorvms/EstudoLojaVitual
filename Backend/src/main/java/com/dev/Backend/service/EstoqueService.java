package com.dev.Backend.service;

import com.dev.Backend.dto.EstoqueHistoricoDTO;
import com.dev.Backend.dto.EstoqueResumoDTO;
import com.dev.Backend.dto.RetalhoDTO;
import com.dev.Backend.entity.*;
import com.dev.Backend.repository.CompraLoteRepository;
import com.dev.Backend.repository.EstoqueMaterialRepository;
import com.dev.Backend.repository.MovimentacaoEstoqueRepository;
import com.dev.Backend.repository.RetalhoRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EstoqueService {

    @Autowired private EstoqueMaterialRepository estoqueMaterialRepository;
    @Autowired private MovimentacaoEstoqueRepository movimentacaoEstoqueRepository;
    @Autowired private CompraLoteRepository compraLoteRepository;
    @Autowired private RetalhoRepository retalhoRepository;

    @Transactional(readOnly = true)
    public Page<EstoqueResumoDTO> listar(String busca, Pageable pageable) {
        Map<Long, BigDecimal> custoMedioPorMaterial = custoMedioPorMaterial();
        Pageable ordenado = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Order.asc("materialDisponivel.descricao").ignoreCase()));
        return estoqueMaterialRepository
                .findByMaterialDisponivelDescricaoContainingIgnoreCase(busca == null ? "" : busca.trim(), ordenado)
                .map(e -> resumo(e, custoMedioPorMaterial.get(e.getMaterialDisponivel().getId())));
    }

    @Transactional(readOnly = true)
    public EstoqueHistoricoDTO historico(Long materialDisponivelId) {
        List<EstoqueHistoricoDTO.Compra> compras = compraLoteRepository.findItensAtivosDoMaterial(materialDisponivelId)
                .stream().map(this::compraDoItem).toList();
        List<EstoqueHistoricoDTO.Movimentacao> movimentacoes = movimentacaoEstoqueRepository
                .findByMaterialDisponivelIdOrderByDataMovimentacaoDesc(materialDisponivelId).stream()
                .filter(m -> m.getTipo() != TipoMovimentacaoEstoque.ENTRADA_COMPRA)
                .map(this::movimentacao)
                .toList();
        List<RetalhoDTO> retalhos = retalhoRepository.findByMaterialDisponivelIdOrderByComprimentoMmDesc(materialDisponivelId)
                .stream().map(RetalhoDTO::from).toList();
        return new EstoqueHistoricoDTO(compras, movimentacoes, retalhos);
    }

    public EstoqueMaterial obterOuCriar(MaterialDisponivel md) {
        return estoqueMaterialRepository.findByMaterialDisponivelId(md.getId())
                .orElseGet(() -> {
                    EstoqueMaterial e = new EstoqueMaterial();
                    e.setMaterialDisponivel(md);
                    e.setMetros(BigDecimal.ZERO);
                    e.setBarras(0);
                    e.setDataAtualizacao(new Date());
                    return estoqueMaterialRepository.save(e);
                });
    }

    @Transactional
    public void entrarCompra(CompraLote compra, MaterialDisponivel md, BigDecimal metros, Integer barras) {
        atualizarSaldo(md, nzi(barras), nz(metros));
        movimentar(md, TipoMovimentacaoEstoque.ENTRADA_COMPRA, metros, barras, "Compra #" + compra.getId(), compra, null);
    }

    @Transactional
    public void estornarCompra(CompraLote compra, MaterialDisponivel md, BigDecimal metros, Integer barras, String ref) {
        atualizarSaldo(md, -nzi(barras), nz(metros).negate());
        movimentar(md, TipoMovimentacaoEstoque.AJUSTE, nz(metros).negate(), -nzi(barras), ref, compra, null);
    }

    /** Sem saldo suficiente o saldo fica negativo: indica o que falta comprar e mantém a devolução exata. */
    @Transactional
    public void baixarBarras(OrdemServico os, MaterialDisponivel md, int quantidade, String ref) {
        if (quantidade <= 0) return;
        BigDecimal metros = metrosDasBarras(md, quantidade);
        atualizarSaldo(md, -quantidade, metros.negate());
        movimentar(md, TipoMovimentacaoEstoque.SAIDA_OS, metros.negate(), -quantidade, ref, null, os);
    }

    @Transactional
    public void devolverBarras(OrdemServico os, MaterialDisponivel md, int quantidade, String ref) {
        if (quantidade <= 0) return;
        BigDecimal metros = metrosDasBarras(md, quantidade);
        atualizarSaldo(md, quantidade, metros);
        movimentar(md, TipoMovimentacaoEstoque.AJUSTE, metros, quantidade, ref, null, os);
    }

    private void atualizarSaldo(MaterialDisponivel md, int barras, BigDecimal metros) {
        EstoqueMaterial e = obterOuCriar(md);
        e.setBarras(nzi(e.getBarras()) + barras);
        e.setMetros(nz(e.getMetros()).add(metros));
        e.setDataAtualizacao(new Date());
        estoqueMaterialRepository.save(e);
    }

    private BigDecimal metrosDasBarras(MaterialDisponivel md, int quantidade) {
        return BigDecimal.valueOf(comprimentoBarraMm(md) / 1000.0).multiply(BigDecimal.valueOf(quantidade));
    }

    /** Barras e metros com o sinal do efeito no saldo: positivo entra, negativo sai. */
    private void movimentar(MaterialDisponivel md, TipoMovimentacaoEstoque tipo, BigDecimal metros, Integer barras,
                            String ref, CompraLote compra, OrdemServico os) {
        MovimentacaoEstoque m = new MovimentacaoEstoque();
        m.setMaterialDisponivel(md);
        m.setTipo(tipo);
        m.setMetros(nz(metros));
        m.setBarras(nzi(barras));
        m.setReferencia(ref);
        m.setCompraLote(compra);
        m.setOrdemServico(os);
        m.setDataMovimentacao(new Date());
        movimentacaoEstoqueRepository.save(m);
    }

    private Map<Long, BigDecimal> custoMedioPorMaterial() {
        Map<Long, BigDecimal> custos = new HashMap<>();
        for (Object[] linha : compraLoteRepository.totaisCompradosPorMaterial()) {
            long barras = linha[1] != null ? ((Number) linha[1]).longValue() : 0;
            BigDecimal valor = linha[2] != null ? (BigDecimal) linha[2] : BigDecimal.ZERO;
            if (barras > 0) {
                custos.put((Long) linha[0], valor.divide(BigDecimal.valueOf(barras), 2, RoundingMode.HALF_UP));
            }
        }
        return custos;
    }

    private EstoqueResumoDTO resumo(EstoqueMaterial e, BigDecimal custoMedioBarra) {
        MaterialDisponivel md = e.getMaterialDisponivel();
        int barras = nzi(e.getBarras());
        BigDecimal valorEstoque = custoMedioBarra != null && barras > 0
                ? custoMedioBarra.multiply(BigDecimal.valueOf(barras))
                : BigDecimal.ZERO;
        return new EstoqueResumoDTO(md.getId(), md.getDescricao(), barras, nz(e.getMetros()),
                comprimentoBarraMm(md), custoMedioBarra, valorEstoque);
    }

    private EstoqueHistoricoDTO.Compra compraDoItem(CompraLoteItem item) {
        CompraLote compra = item.getCompraLote();
        return new EstoqueHistoricoDTO.Compra(
                compra.getId(),
                compra.getDataCompra(),
                item.getDistribuidora() != null ? item.getDistribuidora().getNome() : null,
                compra.getNumeroNota(),
                item.getBarras(),
                comprimentoBarraMm(item.getMaterialDisponivel()),
                item.getValorBarra(),
                item.getValorTotal());
    }

    private EstoqueHistoricoDTO.Movimentacao movimentacao(MovimentacaoEstoque m) {
        OrdemServico os = m.getOrdemServico();
        CotacaoServico cotacao = os != null ? os.getCotacao() : null;
        return new EstoqueHistoricoDTO.Movimentacao(
                m.getId(),
                m.getDataMovimentacao(),
                m.getTipo().name(),
                m.getBarras(),
                m.getMetros(),
                m.getReferencia(),
                m.getCompraLote() != null ? m.getCompraLote().getId() : null,
                os != null ? os.getId() : null,
                os != null ? os.getNome() : null,
                cotacao != null ? cotacao.getId() : null,
                cotacao != null ? cotacao.getNome() : null);
    }

    private int comprimentoBarraMm(MaterialDisponivel md) {
        return md.getComprimentoBarraMm() != null ? md.getComprimentoBarraMm() : 6000;
    }

    private BigDecimal nz(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
    private int nzi(Integer v) { return v != null ? v : 0; }
}
