package com.dev.Backend.dto;

import java.math.BigDecimal;

public record EstoqueResumoDTO(
    Long materialDisponivelId,
    String material,
    Integer barras,
    BigDecimal metros,
    Integer comprimentoBarraMm,
    BigDecimal custoMedioBarra,
    BigDecimal valorEstoque) {
}
