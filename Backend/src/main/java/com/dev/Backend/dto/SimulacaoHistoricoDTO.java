package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.Date;

import lombok.Data;

@Data
public class SimulacaoHistoricoDTO {
    private Long id;
    private String nomeTrabalho;
    private Integer quantidade;
    private BigDecimal percentualPerda;
    private BigDecimal totalCustoEstimado;
    private Date dataCriacao;
}
