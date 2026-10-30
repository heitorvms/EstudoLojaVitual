package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record PlanoCorteDTO(
        int comprimentoBarraMm,
        int espessuraCorteMm,
        int retalhoMinimoMm,
        int totalBarras,
        int totalPecas,
        BigDecimal aproveitamentoPercentual,
        int sucataMm,
        List<PadraoBarra> padroes,
        List<Retalho> retalhos) {

    /** Barras cortadas exatamente do mesmo jeito. */
    public record PadraoBarra(int quantidadeBarras, List<Corte> cortes, int sobraMm) {
    }

    public record Corte(String descricao, int comprimentoMm, int quantidade) {
    }

    public record Retalho(int comprimentoMm, int quantidade) {
    }
}
