package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class MaterialSimulacaoDTO {
    private Long materialId;
    private String nome;
    private BigDecimal consumoPorUnidade;
    private BigDecimal consumoTotal;
    private BigDecimal totalComPerda;
    private BigDecimal tamanho;
    private Integer quantidadeBarras;
    private BigDecimal sobraEstimada;
    private BigDecimal precoUnitario;
    private BigDecimal custoEstimado;
    private Long distribuidoraId;
    private String distribuidoraNome;
    private List<PecaCorteDTO> pecas = new ArrayList<>();
    private PlanoCorteDTO planoCorte;
}
