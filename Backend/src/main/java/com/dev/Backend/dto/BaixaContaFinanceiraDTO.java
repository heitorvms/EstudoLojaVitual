package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.dev.Backend.entity.FormaPagamento;

import lombok.Data;

@Data
public class BaixaContaFinanceiraDTO {
    private BigDecimal valorPago;
    private FormaPagamento formaPagamento;
    private Date dataPagamento;
}
