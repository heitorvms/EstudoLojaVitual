package com.dev.Backend.service;

import com.dev.Backend.entity.*;
import com.dev.Backend.repository.EstoqueMaterialRepository;
import com.dev.Backend.repository.MovimentacaoEstoqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.List;

@Service
public class EstoqueService {

    @Autowired private EstoqueMaterialRepository estoqueMaterialRepository;
    @Autowired private MovimentacaoEstoqueRepository movimentacaoEstoqueRepository;

    public List<EstoqueMaterial> listar() {
        return estoqueMaterialRepository.findAll();
    }

    public EstoqueMaterial obterOuCriar(MaterialDisponivel md) {
        return estoqueMaterialRepository.findByMaterialDisponivelId(md.getId())
                .orElseGet(() -> {
                    EstoqueMaterial e = new EstoqueMaterial();
                    e.setMaterialDisponivel(md);
                    e.setQuantidadeKg(BigDecimal.ZERO);
                    e.setMetros(BigDecimal.ZERO);
                    e.setBarras(0);
                    e.setDataAtualizacao(new Date());
                    return estoqueMaterialRepository.save(e);
                });
    }

    @Transactional
    public void entrarCompra(MaterialDisponivel md, BigDecimal kg, BigDecimal metros, Integer barras, String ref) {
        EstoqueMaterial e = obterOuCriar(md);
        e.setQuantidadeKg(nz(e.getQuantidadeKg()).add(nz(kg)));
        e.setMetros(nz(e.getMetros()).add(nz(metros)));
        e.setBarras(nzi(e.getBarras()) + nzi(barras));
        e.setDataAtualizacao(new Date());
        estoqueMaterialRepository.save(e);
        movimentar(md, TipoMovimentacaoEstoque.ENTRADA_COMPRA, kg, metros, barras, ref);
    }

    @Transactional
    public void estornarCompra(MaterialDisponivel md, BigDecimal kg, BigDecimal metros, Integer barras, String ref) {
        EstoqueMaterial e = obterOuCriar(md);
        e.setQuantidadeKg(nz(e.getQuantidadeKg()).subtract(nz(kg)).max(BigDecimal.ZERO));
        e.setMetros(nz(e.getMetros()).subtract(nz(metros)).max(BigDecimal.ZERO));
        e.setBarras(Math.max(0, nzi(e.getBarras()) - nzi(barras)));
        e.setDataAtualizacao(new Date());
        estoqueMaterialRepository.save(e);
        movimentar(md, TipoMovimentacaoEstoque.AJUSTE,
                nz(kg).negate(), nz(metros).negate(), -nzi(barras), ref);
    }

    @Transactional
    public void baixarBarras(MaterialDisponivel md, int quantidade, String ref) {
        if (quantidade <= 0) return;
        EstoqueMaterial e = obterOuCriar(md);
        BigDecimal metros = metrosDasBarras(md, quantidade);
        BigDecimal kg = kgDosMetros(md, metros);

        // Sem saldo suficiente, a saída ainda é registrada (indica necessidade de compra)
        e.setBarras(Math.max(0, nzi(e.getBarras()) - quantidade));
        e.setMetros(nz(e.getMetros()).subtract(metros).max(BigDecimal.ZERO));
        e.setQuantidadeKg(nz(e.getQuantidadeKg()).subtract(kg).max(BigDecimal.ZERO));
        e.setDataAtualizacao(new Date());
        estoqueMaterialRepository.save(e);
        movimentar(md, TipoMovimentacaoEstoque.SAIDA_OS, kg, metros, quantidade, ref);
    }

    @Transactional
    public void devolverBarras(MaterialDisponivel md, int quantidade, String ref) {
        if (quantidade <= 0) return;
        EstoqueMaterial e = obterOuCriar(md);
        BigDecimal metros = metrosDasBarras(md, quantidade);
        BigDecimal kg = kgDosMetros(md, metros);

        e.setBarras(nzi(e.getBarras()) + quantidade);
        e.setMetros(nz(e.getMetros()).add(metros));
        e.setQuantidadeKg(nz(e.getQuantidadeKg()).add(kg));
        e.setDataAtualizacao(new Date());
        estoqueMaterialRepository.save(e);
        movimentar(md, TipoMovimentacaoEstoque.AJUSTE, kg, metros, quantidade, ref);
    }

    private BigDecimal metrosDasBarras(MaterialDisponivel md, int quantidade) {
        int barraMm = md.getComprimentoBarraMm() != null ? md.getComprimentoBarraMm() : 6000;
        return BigDecimal.valueOf(barraMm / 1000.0).multiply(BigDecimal.valueOf(quantidade));
    }

    private BigDecimal kgDosMetros(MaterialDisponivel md, BigDecimal metros) {
        if (md.getPesoKgPorMetro() == null) return BigDecimal.ZERO;
        return md.getPesoKgPorMetro().multiply(metros).setScale(4, RoundingMode.HALF_UP);
    }

    private void movimentar(MaterialDisponivel md, TipoMovimentacaoEstoque tipo,
                            BigDecimal kg, BigDecimal metros, Integer barras, String ref) {
        MovimentacaoEstoque m = new MovimentacaoEstoque();
        m.setMaterialDisponivel(md);
        m.setTipo(tipo);
        m.setQuantidadeKg(nz(kg));
        m.setMetros(nz(metros));
        m.setBarras(nzi(barras));
        m.setReferencia(ref);
        m.setDataMovimentacao(new Date());
        movimentacaoEstoqueRepository.save(m);
    }

    private BigDecimal nz(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
    private int nzi(Integer v) { return v != null ? v : 0; }
}
