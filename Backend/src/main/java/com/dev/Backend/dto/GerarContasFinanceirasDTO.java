package com.dev.Backend.dto;

import com.dev.Backend.entity.FormaPagamento;

import lombok.Data;

@Data
public class GerarContasFinanceirasDTO {

    private RecebimentoDTO material = new RecebimentoDTO(1, 0);
    private RecebimentoDTO maoDeObra = new RecebimentoDTO(1, 30);
    private Integer intervaloDiasParcelas = 30;
    private Integer diasVencimentoPagar = 15;
    private FormaPagamento formaPagamentoPagar = FormaPagamento.A_VISTA;

    public static GerarContasFinanceirasDTO padrao() {
        return new GerarContasFinanceirasDTO();
    }

    public int intervaloDias() {
        if (intervaloDiasParcelas == null || intervaloDiasParcelas < 1) {
            return 30;
        }
        return intervaloDiasParcelas;
    }

    public int diasPagar() {
        if (diasVencimentoPagar == null || diasVencimentoPagar < 0) {
            return 15;
        }
        return diasVencimentoPagar;
    }

    @Data
    public static class RecebimentoDTO {
        private Integer parcelas;
        private Integer diasPrimeiraParcela;
        private FormaPagamento formaPagamento = FormaPagamento.A_VISTA;

        public RecebimentoDTO() {
            this(1, 0);
        }

        public RecebimentoDTO(int parcelas, int diasPrimeiraParcela) {
            this.parcelas = parcelas;
            this.diasPrimeiraParcela = diasPrimeiraParcela;
        }

        public int totalParcelas() {
            if (parcelas == null || parcelas < 1) {
                return 1;
            }
            return Math.min(parcelas, 24);
        }

        public int diasPrimeira() {
            if (diasPrimeiraParcela == null || diasPrimeiraParcela < 0) {
                return 0;
            }
            return diasPrimeiraParcela;
        }

        public FormaPagamento forma() {
            return formaPagamento != null ? formaPagamento : FormaPagamento.A_VISTA;
        }
    }
}
