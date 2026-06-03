package com.dev.Backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.ConfiguracaoWhatsappDTO;
import com.dev.Backend.service.ConfiguracaoWhatsappService;

@RestController
@RequestMapping("/api/configuracoes/whatsapp")
@CrossOrigin(origins = "http://localhost:3000")
public class ConfiguracaoWhatsappController {

    private final ConfiguracaoWhatsappService service;

    public ConfiguracaoWhatsappController(ConfiguracaoWhatsappService service) {
        this.service = service;
    }

    @GetMapping
    public ConfiguracaoWhatsappDTO obter() {
        return service.obter();
    }

    @PutMapping
    public ConfiguracaoWhatsappDTO salvar(@RequestBody ConfiguracaoWhatsappDTO dto) {
        return service.salvar(dto);
    }
}
