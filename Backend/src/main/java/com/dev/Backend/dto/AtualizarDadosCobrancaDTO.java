package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.Date;

public class AtualizarDadosCobrancaDTO {

    private BigDecimal valorPendente;
    private Date dataVencimento;

    public BigDecimal getValorPendente() {
        return valorPendente;
    }

    public void setValorPendente(BigDecimal valorPendente) {
        this.valorPendente = valorPendente;
    }

    public Date getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(Date dataVencimento) {
        this.dataVencimento = dataVencimento;
    }
}
