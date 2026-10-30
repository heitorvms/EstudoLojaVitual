package com.dev.Backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.ConfiguracaoProducaoDTO;
import com.dev.Backend.service.ConfiguracaoProducaoService;

@RestController
@RequestMapping("/api/configuracoes/producao")
@CrossOrigin(origins = "http://localhost:3000")
public class ConfiguracaoProducaoController {

    private final ConfiguracaoProducaoService service;

    public ConfiguracaoProducaoController(ConfiguracaoProducaoService service) {
        this.service = service;
    }

    @GetMapping
    public ConfiguracaoProducaoDTO obter() {
        return service.obter();
    }

    @PutMapping
    public ConfiguracaoProducaoDTO salvar(@RequestBody ConfiguracaoProducaoDTO dto) {
        return service.salvar(dto);
    }
}
