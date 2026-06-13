package com.dev.Backend.dto;

import com.dev.Backend.entity.FormaPagamento;

import lombok.Data;

@Data
public class GerarContasFinanceirasDTO {

    private Integer quantidadeParcelasReceber = 1;
    private Integer intervaloDiasParcelas = 30;
    private Integer diasVencimentoPagar = 15;
    private Integer diasPrimeiraParcela = 30;
    private FormaPagamento formaPagamentoReceber = FormaPagamento.A_VISTA;
    private FormaPagamento formaPagamentoPagar = FormaPagamento.A_VISTA;

    public static GerarContasFinanceirasDTO padrao() {
        return new GerarContasFinanceirasDTO();
    }

    public int parcelasReceber() {
        if (quantidadeParcelasReceber == null || quantidadeParcelasReceber < 1) {
            return 1;
        }
        return Math.min(quantidadeParcelasReceber, 24);
    }

    public int intervaloDias() {
        if (intervaloDiasParcelas == null || intervaloDiasParcelas < 1) {
            return 30;
        }
        return intervaloDiasParcelas;
    }

    public int diasPagar() {
        if (diasVencimentoPagar == null || diasVencimentoPagar < 1) {
            return 15;
        }
        return diasVencimentoPagar;
    }

    public int diasPrimeira() {
        if (diasPrimeiraParcela == null || diasPrimeiraParcela < 0) {
            return 30;
        }
        return diasPrimeiraParcela;
    }
}
