package com.dev.Backend.dto;

public class PrecoMaterialCotacaoDTO {
    private Long id;
    private DistribuidoraDTO distribuidora;
    private Double preco;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DistribuidoraDTO getDistribuidora() { return distribuidora; }
    public void setDistribuidora(DistribuidoraDTO distribuidora) { this.distribuidora = distribuidora; }
    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }
}