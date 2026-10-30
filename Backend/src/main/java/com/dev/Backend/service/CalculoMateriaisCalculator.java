package com.dev.Backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import com.dev.Backend.dto.MaterialSimulacaoDTO;
import com.dev.Backend.dto.PecaCorteDTO;
import com.dev.Backend.dto.PlanoCorteDTO;
import com.dev.Backend.entity.MaterialDisponivel;

public final class CalculoMateriaisCalculator {

    private static final int SCALE_DIMENSAO = 4;
    private static final BigDecimal CEM = BigDecimal.valueOf(100);
    private static final BigDecimal MIL = BigDecimal.valueOf(1000);

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

    /** Substitui a estimativa por percentual de perda pelas barras do plano de corte. */
    public static void aplicarPlanoCorte(MaterialSimulacaoDTO dto, PlanoCorteDTO plano) {
        BigDecimal metragemPedida = dto.getTamanho().multiply(BigDecimal.valueOf(plano.totalBarras()))
            .setScale(SCALE_DIMENSAO, RoundingMode.HALF_UP);
        dto.setQuantidadeBarras(plano.totalBarras());
        dto.setTotalComPerda(metragemPedida);
        dto.setSobraEstimada(metragemPedida.subtract(dto.getConsumoTotal())
            .setScale(SCALE_DIMENSAO, RoundingMode.HALF_UP));
        dto.setPlanoCorte(plano);
    }

    public static BigDecimal consumoDasPecas(List<PecaCorteDTO> pecas) {
        long totalMm = pecas.stream()
            .mapToLong(p -> (long) p.comprimentoMm() * p.quantidade())
            .sum();
        return BigDecimal.valueOf(totalMm).divide(MIL, SCALE_DIMENSAO, RoundingMode.HALF_UP);
    }

    public static int comprimentoBarraMm(MaterialDisponivel material) {
        return material.getTamanho().multiply(MIL).setScale(0, RoundingMode.HALF_UP).intValueExact();
    }
}
