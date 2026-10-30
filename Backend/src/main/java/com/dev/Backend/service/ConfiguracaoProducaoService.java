package com.dev.Backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.dto.ConfiguracaoProducaoDTO;
import com.dev.Backend.entity.ConfiguracaoProducao;
import com.dev.Backend.repository.ConfiguracaoProducaoRepository;

@Service
public class ConfiguracaoProducaoService {

    private static final int ESPESSURA_CORTE_MAXIMA_MM = 20;
    private static final int RETALHO_MINIMO_MAXIMO_MM = 6000;

    private final ConfiguracaoProducaoRepository repository;

    public ConfiguracaoProducaoService(ConfiguracaoProducaoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoProducao buscar() {
        return repository.findById(ConfiguracaoProducao.ID_UNICO).orElseGet(ConfiguracaoProducao::new);
    }

    @Transactional(readOnly = true)
    public ConfiguracaoProducaoDTO obter() {
        return toDto(buscar());
    }

    @Transactional
    public ConfiguracaoProducaoDTO salvar(ConfiguracaoProducaoDTO dto) {
        ConfiguracaoProducao config = buscar();
        config.setEspessuraCorteMm(validarFaixa(dto.espessuraCorteMm(), ESPESSURA_CORTE_MAXIMA_MM,
                "Espessura do corte"));
        config.setRetalhoMinimoMm(validarFaixa(dto.retalhoMinimoMm(), RETALHO_MINIMO_MAXIMO_MM,
                "Tamanho mínimo de retalho"));
        return toDto(repository.save(config));
    }

    private int validarFaixa(Integer valor, int maximo, String campo) {
        if (valor == null || valor < 0 || valor > maximo) {
            throw new IllegalArgumentException(campo + " deve estar entre 0 e " + maximo + " mm.");
        }
        return valor;
    }

    private ConfiguracaoProducaoDTO toDto(ConfiguracaoProducao config) {
        return new ConfiguracaoProducaoDTO(config.getEspessuraCorteMm(), config.getRetalhoMinimoMm());
    }
}
