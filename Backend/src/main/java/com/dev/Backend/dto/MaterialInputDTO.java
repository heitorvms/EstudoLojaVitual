package com.dev.Backend.dto;

import java.math.BigDecimal;

public class MaterialInputDTO {
    private Long materialDisponivelId;
    private Integer quantidade;
    private BigDecimal metros;
    private BigDecimal pesoKg;

    public Long getMaterialDisponivelId() { return materialDisponivelId; }
    public void setMaterialDisponivelId(Long materialDisponivelId) { this.materialDisponivelId = materialDisponivelId; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public BigDecimal getMetros() { return metros; }
    public void setMetros(BigDecimal metros) { this.metros = metros; }
    public BigDecimal getPesoKg() { return pesoKg; }
    public void setPesoKg(BigDecimal pesoKg) { this.pesoKg = pesoKg; }
}
