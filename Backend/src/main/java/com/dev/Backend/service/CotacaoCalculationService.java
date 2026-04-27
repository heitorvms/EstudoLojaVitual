package com.dev.Backend.service;

import com.dev.Backend.dto.DistribuidoraCotacaoDTO;
import com.dev.Backend.entity.CotacaoServico;
import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.entity.PrecoMaterialCotacao;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CotacaoCalculationService {

    public List<DistribuidoraCotacaoDTO> calcularValoresPorDistribuidora(CotacaoServico cotacao, Double percentualLucro) {
        Map<Long, DistribuidoraCotacaoDTO> resultados = new HashMap<>();

        for (PrecoMaterialCotacao preco : cotacao.getPrecosMateriais()) {
            Distribuidora distribuidora = preco.getDistribuidora();
            Double valorItem = preco.getPreco() * preco.getMaterial().getQuantidade();

            resultados.computeIfAbsent(distribuidora.getId(), k -> {
                DistribuidoraCotacaoDTO dto = new DistribuidoraCotacaoDTO();
                dto.setDistribuidoraId(distribuidora.getId());
                dto.setNome(distribuidora.getNome());
                dto.setValorTotal(0.0);
                return dto;
            });

            DistribuidoraCotacaoDTO dto = resultados.get(distribuidora.getId());
            dto.setValorTotal(dto.getValorTotal() + valorItem);
            dto.setValorTotalComLucro(dto.getValorTotal() * (1 + percentualLucro / 100));
        }

        return new ArrayList<>(resultados.values());
    }

    public DistribuidoraCotacaoDTO buscarDistribuidoraMaisBarata(CotacaoServico cotacao, Double percentualLucro) {
        List<DistribuidoraCotacaoDTO> distribuidoras = calcularValoresPorDistribuidora(cotacao, percentualLucro);
        
        return distribuidoras.stream()
            .min(Comparator.comparing(DistribuidoraCotacaoDTO::getValorTotalComLucro))
            .orElse(null);
    }
}