package com.dev.Backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ItemSimulacaoInputDTO {
    private Long materialDisponivelId;
    private BigDecimal consumoPorUnidade;
}
