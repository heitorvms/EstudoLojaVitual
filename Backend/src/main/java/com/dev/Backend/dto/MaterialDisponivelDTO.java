package com.dev.Backend.dto;

import java.math.BigDecimal;

public class MaterialDisponivelDTO {
    private Long id;
    private String descricao;
    private BigDecimal tamanho;
    private String unidade;
    private Integer comprimentoBarraMm;
    private BigDecimal pesoKgPorMetro;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getTamanho() { return tamanho; }
    public void setTamanho(BigDecimal tamanho) { this.tamanho = tamanho; }
    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public Integer getComprimentoBarraMm() { return comprimentoBarraMm; }
    public void setComprimentoBarraMm(Integer comprimentoBarraMm) { this.comprimentoBarraMm = comprimentoBarraMm; }
    public BigDecimal getPesoKgPorMetro() { return pesoKgPorMetro; }
    public void setPesoKgPorMetro(BigDecimal pesoKgPorMetro) { this.pesoKgPorMetro = pesoKgPorMetro; }
}
