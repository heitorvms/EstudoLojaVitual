package com.dev.Backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.dev.Backend.dto.PecaCorteDTO;
import com.dev.Backend.dto.PlanoCorteDTO;

/**
 * Plano de corte unidimensional por "Best Fit Decreasing": peças da maior para a menor,
 * cada uma na barra aberta com a menor sobra em que ainda cabe.
 */
public final class PlanoCorteCalculator {

    static final int LIMITE_PECAS = 20_000;
    private static final String PECA_SEM_NOME = "Peça";

    private PlanoCorteCalculator() {
    }

    public static PlanoCorteDTO calcular(List<PecaCorteDTO> pecasPorUnidade, int unidades,
                                         int comprimentoBarraMm, int espessuraCorteMm, int retalhoMinimoMm) {
        if (comprimentoBarraMm <= 0) {
            throw new IllegalStateException("Comprimento da barra inválido para o plano de corte.");
        }
        if (unidades < 1) {
            throw new IllegalArgumentException("Quantidade de unidades deve ser maior ou igual a 1.");
        }
        List<Peca> pecas = expandir(pecasPorUnidade, unidades, comprimentoBarraMm);
        List<Barra> barras = distribuir(pecas, comprimentoBarraMm, Math.max(0, espessuraCorteMm));
        return resumir(barras, pecas, comprimentoBarraMm, espessuraCorteMm, retalhoMinimoMm);
    }

    private static List<Peca> expandir(List<PecaCorteDTO> pecasPorUnidade, int unidades, int comprimentoBarraMm) {
        List<Peca> pecas = new ArrayList<>();
        for (PecaCorteDTO p : pecasPorUnidade) {
            String nome = nome(p);
            if (p.comprimentoMm() == null || p.comprimentoMm() <= 0
                    || p.quantidade() == null || p.quantidade() <= 0) {
                throw new IllegalArgumentException(
                        "A peça \"" + nome + "\" precisa de comprimento e quantidade maiores que zero.");
            }
            if (p.comprimentoMm() > comprimentoBarraMm) {
                throw new IllegalStateException("A peça \"" + nome + "\" (" + cm(p.comprimentoMm())
                        + ") é maior que a barra (" + cm(comprimentoBarraMm) + ").");
            }
            long total = (long) p.quantidade() * unidades;
            if (pecas.size() + total > LIMITE_PECAS) {
                throw new IllegalStateException(
                        "O plano de corte aceita no máximo " + LIMITE_PECAS + " peças por material.");
            }
            for (long i = 0; i < total; i++) {
                pecas.add(new Peca(nome, p.comprimentoMm()));
            }
        }
        pecas.sort(Comparator.comparingInt(Peca::comprimentoMm).reversed());
        return pecas;
    }

    private static List<Barra> distribuir(List<Peca> pecas, int comprimentoBarraMm, int espessuraCorteMm) {
        List<Barra> barras = new ArrayList<>();
        TreeMap<Integer, Deque<Barra>> barrasPorSobra = new TreeMap<>();
        for (Peca peca : pecas) {
            Map.Entry<Integer, Deque<Barra>> menorQueCabe = barrasPorSobra.ceilingEntry(peca.comprimentoMm());
            Barra barra;
            if (menorQueCabe == null) {
                barra = new Barra(comprimentoBarraMm);
                barras.add(barra);
            } else {
                barra = menorQueCabe.getValue().pollFirst();
                if (menorQueCabe.getValue().isEmpty()) {
                    barrasPorSobra.remove(menorQueCabe.getKey());
                }
            }
            barra.cortar(peca, espessuraCorteMm);
            if (barra.sobraMm > 0) {
                barrasPorSobra.computeIfAbsent(barra.sobraMm, k -> new ArrayDeque<>()).addLast(barra);
            }
        }
        return barras;
    }

    private static PlanoCorteDTO resumir(List<Barra> barras, List<Peca> pecas, int comprimentoBarraMm,
                                         int espessuraCorteMm, int retalhoMinimoMm) {
        Map<PlanoCorteDTO.PadraoBarra, Integer> padroes = new LinkedHashMap<>();
        Map<Integer, Integer> retalhos = new TreeMap<>(Comparator.reverseOrder());
        int sucataMm = 0;

        for (Barra barra : barras) {
            padroes.merge(new PlanoCorteDTO.PadraoBarra(0, barra.cortesAgrupados(), barra.sobraMm), 1, Integer::sum);
            if (barra.sobraMm > 0 && barra.sobraMm >= retalhoMinimoMm) {
                retalhos.merge(barra.sobraMm, 1, Integer::sum);
            } else {
                sucataMm += barra.sobraMm;
            }
        }

        List<PlanoCorteDTO.PadraoBarra> listaPadroes = padroes.entrySet().stream()
                .map(e -> new PlanoCorteDTO.PadraoBarra(e.getValue(), e.getKey().cortes(), e.getKey().sobraMm()))
                .sorted(Comparator.comparingInt(PlanoCorteDTO.PadraoBarra::quantidadeBarras).reversed())
                .toList();
        List<PlanoCorteDTO.Retalho> listaRetalhos = retalhos.entrySet().stream()
                .map(e -> new PlanoCorteDTO.Retalho(e.getKey(), e.getValue()))
                .toList();

        return new PlanoCorteDTO(comprimentoBarraMm, espessuraCorteMm, retalhoMinimoMm, barras.size(),
                pecas.size(), aproveitamento(pecas, barras.size(), comprimentoBarraMm), sucataMm,
                listaPadroes, listaRetalhos);
    }

    private static BigDecimal aproveitamento(List<Peca> pecas, int totalBarras, int comprimentoBarraMm) {
        if (totalBarras == 0) {
            return BigDecimal.ZERO;
        }
        long usado = pecas.stream().mapToLong(Peca::comprimentoMm).sum();
        return BigDecimal.valueOf(usado * 100)
                .divide(BigDecimal.valueOf((long) totalBarras * comprimentoBarraMm), 1, RoundingMode.HALF_UP);
    }

    private static String nome(PecaCorteDTO p) {
        return p.descricao() == null || p.descricao().isBlank() ? PECA_SEM_NOME : p.descricao().trim();
    }

    private static String cm(int mm) {
        return BigDecimal.valueOf(mm, 1).stripTrailingZeros().toPlainString().replace('.', ',') + " cm";
    }

    private record Peca(String descricao, int comprimentoMm) {
    }

    private static final class Barra {
        private final List<Peca> pecas = new ArrayList<>();
        private int sobraMm;

        Barra(int comprimentoMm) {
            this.sobraMm = comprimentoMm;
        }

        void cortar(Peca peca, int espessuraCorteMm) {
            pecas.add(peca);
            sobraMm = Math.max(0, sobraMm - peca.comprimentoMm() - espessuraCorteMm);
        }

        List<PlanoCorteDTO.Corte> cortesAgrupados() {
            Map<Peca, Integer> contagem = new LinkedHashMap<>();
            pecas.forEach(p -> contagem.merge(p, 1, Integer::sum));
            return contagem.entrySet().stream()
                    .map(e -> new PlanoCorteDTO.Corte(e.getKey().descricao(), e.getKey().comprimentoMm(), e.getValue()))
                    .toList();
        }
    }
}
