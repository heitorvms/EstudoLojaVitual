package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class MaterialInputDTO {
    private Long materialDisponivelId;
    private Integer quantidade;
    private BigDecimal metros;
    private BigDecimal pesoKg;
    /** Peças de corte com a quantidade total do serviço. */
    private List<PecaCorteDTO> pecas = new ArrayList<>();

    public Long getMaterialDisponivelId() { return materialDisponivelId; }
    public void setMaterialDisponivelId(Long materialDisponivelId) { this.materialDisponivelId = materialDisponivelId; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public BigDecimal getMetros() { return metros; }
    public void setMetros(BigDecimal metros) { this.metros = metros; }
    public BigDecimal getPesoKg() { return pesoKg; }
    public void setPesoKg(BigDecimal pesoKg) { this.pesoKg = pesoKg; }
    public List<PecaCorteDTO> getPecas() { return pecas; }
    public void setPecas(List<PecaCorteDTO> pecas) { this.pecas = pecas; }
}
