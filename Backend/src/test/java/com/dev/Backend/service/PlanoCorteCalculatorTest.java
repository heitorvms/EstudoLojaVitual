package com.dev.Backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.dev.Backend.dto.PecaCorteDTO;
import com.dev.Backend.dto.PlanoCorteDTO;

class PlanoCorteCalculatorTest {

    private static final int BARRA_6M = 6000;
    private static final int ESPESSURA_DISCO = 3;
    private static final int RETALHO_MINIMO = 100;

    @Test
    void vinteBarrasDeFerroChatoGeramVinteRetalhosDe12cm() {
        List<PecaCorteDTO> pecas = List.of(new PecaCorteDTO("Travessa", 2937, 2));

        PlanoCorteDTO plano = PlanoCorteCalculator.calcular(pecas, 20, BARRA_6M, ESPESSURA_DISCO, RETALHO_MINIMO);

        assertEquals(20, plano.totalBarras());
        assertEquals(40, plano.totalPecas());
        assertEquals(List.of(new PlanoCorteDTO.Retalho(120, 20)), plano.retalhos());
        assertEquals(0, plano.sucataMm());
        assertEquals(1, plano.padroes().size());
        assertEquals(120, plano.padroes().get(0).sobraMm());
    }

    @Test
    void encaixaPecasMenoresNasSobrasDasBarras() {
        List<PecaCorteDTO> pecas = List.of(
                new PecaCorteDTO("Perna", 450, 4),
                new PecaCorteDTO("Encosto", 800, 2),
                new PecaCorteDTO("Assento", 4000, 1));

        PlanoCorteDTO plano = PlanoCorteCalculator.calcular(pecas, 10, BARRA_6M, ESPESSURA_DISCO, RETALHO_MINIMO);

        int pecasNoPlano = plano.padroes().stream()
                .mapToInt(p -> p.quantidadeBarras() * p.cortes().stream().mapToInt(PlanoCorteDTO.Corte::quantidade).sum())
                .sum();
        assertEquals(70, plano.totalPecas());
        assertEquals(70, pecasNoPlano);
        for (PlanoCorteDTO.PadraoBarra padrao : plano.padroes()) {
            int usado = padrao.cortes().stream()
                    .mapToInt(c -> (c.comprimentoMm() + ESPESSURA_DISCO) * c.quantidade())
                    .sum();
            assertTrue(usado - ESPESSURA_DISCO <= BARRA_6M, "Barra excedida: " + padrao);
        }
        assertEquals(14, plano.totalBarras());
    }

    @Test
    void sobraMenorQueOMinimoViraSucata() {
        List<PecaCorteDTO> pecas = List.of(new PecaCorteDTO("Peça", 5950, 1));

        PlanoCorteDTO plano = PlanoCorteCalculator.calcular(pecas, 3, BARRA_6M, ESPESSURA_DISCO, RETALHO_MINIMO);

        assertTrue(plano.retalhos().isEmpty());
        assertEquals(3 * 47, plano.sucataMm());
    }

    @Test
    void pecaMaiorQueABarraEhRejeitada() {
        List<PecaCorteDTO> pecas = List.of(new PecaCorteDTO("Viga", 6500, 1));

        assertThrows(IllegalStateException.class,
                () -> PlanoCorteCalculator.calcular(pecas, 1, BARRA_6M, ESPESSURA_DISCO, RETALHO_MINIMO));
    }
}
