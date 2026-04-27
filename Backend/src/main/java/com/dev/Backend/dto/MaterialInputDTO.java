package com.dev.Backend.dto;

public class MaterialInputDTO {
    private Long materialDisponivelId;
    private Integer quantidade;

    public Long getMaterialDisponivelId() { return materialDisponivelId; }
    public void setMaterialDisponivelId(Long materialDisponivelId) { this.materialDisponivelId = materialDisponivelId; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
}