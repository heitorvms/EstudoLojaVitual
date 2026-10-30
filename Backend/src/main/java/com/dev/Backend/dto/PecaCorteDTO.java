package com.dev.Backend.dto;

/** Peça cortada de uma barra; {@code quantidade} é por unidade produzida. */
public record PecaCorteDTO(String descricao, Integer comprimentoMm, Integer quantidade) {
}
