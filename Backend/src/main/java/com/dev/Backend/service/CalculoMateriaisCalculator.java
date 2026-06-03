package com.dev.Backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.dev.Backend.dto.MaterialSimulacaoDTO;
import com.dev.Backend.entity.MaterialDisponivel;

public final class CalculoMateriaisCalculator {

    private static final int SCALE_DIMENSAO = 4;
    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    private CalculoMateriaisCalculator() {
    }

    public static MaterialSimulacaoDTO calcular(MaterialDisponivel material,
                                                BigDecimal consumoPorUnidade,
                                                int quantidade,
                                                BigDecimal percentualPerda) {
        if (material == null) {
            throw new IllegalArgumentException("Material disponível é obrigatório.");
        }
        if (consumoPorUnidade == null || consumoPorUnidade.signum() <= 0) {
            throw new IllegalStateException(
                "Consumo por unidade inválido para o material '" + material.getDescricao() + "'.");
        }

        BigDecimal tamanho = material.getTamanho();
        if (tamanho == null || tamanho.signum() <= 0) {
            throw new IllegalStateException(
                "Material '" + material.getDescricao() + "' sem tamanho cadastrado.");
        }

        BigDecimal qtd = BigDecimal.valueOf(quantidade);
        BigDecimal perda = percentualPerda == null ? BigDecimal.ZERO : percentualPerda;

        BigDecimal consumoTotal = consumoPorUnidade.multiply(qtd)
            .setScale(SCALE_DIMENSAO, RoundingMode.HALF_UP);

        BigDecimal acrescimo = consumoTotal.multiply(perda)
            .divide(CEM, SCALE_DIMENSAO, RoundingMode.HALF_UP);

        BigDecimal consumoComPerda = consumoTotal.add(acrescimo)
            .setScale(SCALE_DIMENSAO, RoundingMode.HALF_UP);

        int barras = consumoComPerda.divide(tamanho, 0, RoundingMode.CEILING).intValueExact();

        BigDecimal metragemPedida = BigDecimal.valueOf(barras).multiply(tamanho)
            .setScale(SCALE_DIMENSAO, RoundingMode.HALF_UP);

        BigDecimal sobra = metragemPedida.subtract(consumoComPerda)
            .setScale(SCALE_DIMENSAO, RoundingMode.HALF_UP);

        MaterialSimulacaoDTO dto = new MaterialSimulacaoDTO();
        dto.setMaterialId(material.getId());
        dto.setNome(material.getDescricao());
        dto.setConsumoPorUnidade(consumoPorUnidade);
        dto.setConsumoTotal(consumoTotal);
        dto.setTotalComPerda(metragemPedida);
        dto.setTamanho(tamanho);
        dto.setQuantidadeBarras(barras);
        dto.setSobraEstimada(sobra);
        dto.setPrecoUnitario(null);
        dto.setCustoEstimado(null);
        return dto;
    }
}
