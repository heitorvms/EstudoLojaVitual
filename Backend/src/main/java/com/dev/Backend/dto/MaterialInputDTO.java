package com.dev.Backend.dto;

public class MaterialInputDTO {
    private Long materialDisponivelId; // ID do material disponível
    private Integer quantidade; // Quantidade do material

    // Getters e Setters
    public Long getMaterialDisponivelId() { return materialDisponivelId; }
    public void setMaterialDisponivelId(Long materialDisponivelId) { this.materialDisponivelId = materialDisponivelId; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
}