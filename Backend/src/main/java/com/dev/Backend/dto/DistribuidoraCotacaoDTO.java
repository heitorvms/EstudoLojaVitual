package com.dev.Backend.dto;

public class DistribuidoraCotacaoDTO {
    private Long distribuidoraId;
    private String nome;
    private Double valorTotal;
    private Double valorTotalComLucro;

    public Long getDistribuidoraId() { return distribuidoraId; }
    public void setDistribuidoraId(Long distribuidoraId) { this.distribuidoraId = distribuidoraId; }
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public Double getValorTotal() { return valorTotal; }
    public void setValorTotal(Double valorTotal) { this.valorTotal = valorTotal; }
    
    public Double getValorTotalComLucro() { return valorTotalComLucro; }
    public void setValorTotalComLucro(Double valorTotalComLucro) { this.valorTotalComLucro = valorTotalComLucro; }
}