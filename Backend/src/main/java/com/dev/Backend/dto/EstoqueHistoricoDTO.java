package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public record EstoqueHistoricoDTO(
    List<Compra> compras,
    List<Movimentacao> movimentacoes,
    List<RetalhoDTO> retalhos) {

    public record Compra(
        Long compraId,
        Date dataCompra,
        String distribuidora,
        String numeroNota,
        Integer barras,
        Integer comprimentoBarraMm,
        BigDecimal valorBarra,
        BigDecimal valorTotal) {
    }

    public record Movimentacao(
        Long id,
        Date data,
        String tipo,
        Integer barras,
        BigDecimal metros,
        String referencia,
        Long compraId,
        Long ordemServicoId,
        String ordemServicoNome,
        Long cotacaoId,
        String cotacaoNome) {
    }
}
