package com.dev.Backend.dto;

public class PrecoMaterialInputDTO {
    private Long materialId; // ID do material
    private String distribuidoraNome; // Nome da distribuidora
    private Double preco; // Preço do material para essa distribuidora

    // Getters e Setters
    public Long getMaterialId() { return materialId; }
    public void setMaterialId(Long materialId) { this.materialId = materialId; }
    public String getDistribuidoraNome() { return distribuidoraNome; }
    public void setDistribuidoraNome(String distribuidoraNome) { this.distribuidoraNome = distribuidoraNome; }
    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }
}