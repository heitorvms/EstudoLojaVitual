package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class MaterialDTO {
    private Long id;
    private String quantidade;
    private BigDecimal metros;
    private MaterialDisponivelDTO materialDisponivel;
    private List<PrecoMaterialCotacaoDTO> precos;
    private List<PecaCorteDTO> pecas;
    private PlanoCorteDTO planoCorte;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuantidade() { return quantidade; }
    public void setQuantidade(String quantidade) { this.quantidade = quantidade; }
    public BigDecimal getMetros() { return metros; }
    public void setMetros(BigDecimal metros) { this.metros = metros; }
    public MaterialDisponivelDTO getMaterialDisponivel() { return materialDisponivel; }
    public void setMaterialDisponivel(MaterialDisponivelDTO materialDisponivel) { this.materialDisponivel = materialDisponivel; }
    public List<PrecoMaterialCotacaoDTO> getPrecos() { return precos; }
    public void setPrecos(List<PrecoMaterialCotacaoDTO> precos) { this.precos = precos; }
    public List<PecaCorteDTO> getPecas() { return pecas; }
    public void setPecas(List<PecaCorteDTO> pecas) { this.pecas = pecas; }
    public PlanoCorteDTO getPlanoCorte() { return planoCorte; }
    public void setPlanoCorte(PlanoCorteDTO planoCorte) { this.planoCorte = planoCorte; }
}
