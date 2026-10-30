package com.dev.Backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dev.Backend.dto.PecaCorteDTO;
import com.dev.Backend.dto.PlanoCorteDTO;
import com.dev.Backend.entity.ConfiguracaoProducao;
import com.dev.Backend.entity.Material;
import com.dev.Backend.entity.MaterialDisponivel;

@Service
public class PlanoCorteService {

    static final int LIMITE_TIPOS_PECA = 50;
    static final int TAMANHO_DESCRICAO_PECA = 80;

    private final ConfiguracaoProducaoService configuracaoProducaoService;

    public PlanoCorteService(ConfiguracaoProducaoService configuracaoProducaoService) {
        this.configuracaoProducaoService = configuracaoProducaoService;
    }

    /** Valida as peças recebidas e devolve a lista com descrições limpas. */
    public List<PecaCorteDTO> normalizar(List<PecaCorteDTO> pecas) {
        if (pecas == null) {
            return List.of();
        }
        if (pecas.size() > LIMITE_TIPOS_PECA) {
            throw new IllegalArgumentException(
                "Cada material aceita no máximo " + LIMITE_TIPOS_PECA + " tipos de peça.");
        }
        return pecas.stream().map(this::normalizar).toList();
    }

    public PlanoCorteDTO calcular(List<PecaCorteDTO> pecas, int unidades, MaterialDisponivel material) {
        ConfiguracaoProducao config = configuracaoProducaoService.buscar();
        return PlanoCorteCalculator.calcular(pecas, unidades,
            CalculoMateriaisCalculator.comprimentoBarraMm(material),
            config.getEspessuraCorteMm(), config.getRetalhoMinimoMm());
    }

    /** Plano para exibição de dados já salvos; {@code null} quando não há peças ou o cadastro mudou. */
    public PlanoCorteDTO paraExibicao(List<PecaCorteDTO> pecas, int unidades, MaterialDisponivel material) {
        if (pecas.isEmpty() || material == null || material.getTamanho() == null
            || material.getTamanho().signum() <= 0) {
            return null;
        }
        try {
            return calcular(pecas, unidades, material);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return null;
        }
    }

    /** Peças do material de cotação já são o total do serviço. */
    public PlanoCorteDTO doMaterialDaCotacao(Material material) {
        return paraExibicao(pecasDe(material), 1, material.getMaterialDisponivel());
    }

    public List<PecaCorteDTO> pecasDe(Material material) {
        return material.getPecas().stream()
            .map(p -> new PecaCorteDTO(p.getDescricao(), p.getComprimentoMm(), p.getQuantidade()))
            .toList();
    }

    private PecaCorteDTO normalizar(PecaCorteDTO p) {
        if (p == null || p.comprimentoMm() == null || p.comprimentoMm() <= 0
            || p.quantidade() == null || p.quantidade() <= 0) {
            throw new IllegalArgumentException(
                "Cada peça precisa de comprimento e quantidade maiores que zero.");
        }
        String descricao = p.descricao() == null || p.descricao().isBlank() ? null : p.descricao().trim();
        if (descricao != null && descricao.length() > TAMANHO_DESCRICAO_PECA) {
            throw new IllegalArgumentException(
                "Descrição da peça deve ter até " + TAMANHO_DESCRICAO_PECA + " caracteres.");
        }
        return new PecaCorteDTO(descricao, p.comprimentoMm(), p.quantidade());
    }
}
