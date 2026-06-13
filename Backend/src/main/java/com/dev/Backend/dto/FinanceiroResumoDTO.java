package com.dev.Backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class FinanceiroResumoDTO {
    private BigDecimal totalReceberPendente = BigDecimal.ZERO;
    private BigDecimal totalPagarPendente = BigDecimal.ZERO;
    private BigDecimal totalVencidoReceber = BigDecimal.ZERO;
    private long quantidadeContasVencidas;
    private long quantidadeContasPendentes;
    private long quantidadeContasPagas;
}
