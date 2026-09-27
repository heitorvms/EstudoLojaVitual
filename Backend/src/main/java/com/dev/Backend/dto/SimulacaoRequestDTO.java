package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class SimulacaoRequestDTO {
    private String nomeTrabalho;
    private Integer quantidade;
    private BigDecimal percentualPerda;
    private BigDecimal percentualInsumos;
    private BigDecimal valorFrete;
    private Boolean padronizado = false;
    private List<ItemSimulacaoInputDTO> itens = new ArrayList<>();
}
