package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class SimulacaoResponseDTO {
    private Long id;
    private String nomeTrabalho;
    private Integer quantidade;
    private BigDecimal percentualPerda;
    private BigDecimal percentualInsumos;
    private BigDecimal valorFrete;
    private BigDecimal totalCustoMateriais;
    private BigDecimal valorInsumos;
    private BigDecimal totalCustoEstimado;
    private Date dataCriacao;
    private List<MaterialSimulacaoDTO> materiais = new ArrayList<>();
    private List<ItemPersistidoDTO> itens = new ArrayList<>();
}
