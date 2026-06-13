package com.dev.Backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.WhatsappEnvioLogDTO;
import com.dev.Backend.dto.WhatsappEnvioResponseDTO;
import com.dev.Backend.service.WhatsappService;

@RestController
@RequestMapping("/api/cotacoes")
@CrossOrigin(origins = "http://localhost:3000")
public class WhatsappController {

    private final WhatsappService whatsappService;

    public WhatsappController(WhatsappService whatsappService) {
        this.whatsappService = whatsappService;
    }

    @GetMapping("/{id}/whatsapp/logs")
    @PreAuthorize("hasAnyAuthority('Admin', 'Gerente')")
    public ResponseEntity<List<WhatsappEnvioLogDTO>> listarLogsWhatsapp(@PathVariable Long id) {
        return ResponseEntity.ok(whatsappService.listarLogs(id));
    }

    @PostMapping("/{id}/whatsapp/orcamento")
    @PreAuthorize("hasAnyAuthority('Admin', 'Gerente')")
    public ResponseEntity<WhatsappEnvioResponseDTO> enviarOrcamentoWhatsapp(@PathVariable Long id) {
        whatsappService.enviarOrcamento(id);
        WhatsappEnvioResponseDTO resposta = new WhatsappEnvioResponseDTO(
                "SUCESSO",
                "Orçamento enviado via WhatsApp com sucesso!");
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/{id}/whatsapp/cobranca")
    @PreAuthorize("hasAnyAuthority('Admin', 'Gerente')")
    public ResponseEntity<WhatsappEnvioResponseDTO> enviarCobrancaWhatsapp(@PathVariable Long id) {
        whatsappService.enviarCobranca(id);
        WhatsappEnvioResponseDTO resposta = new WhatsappEnvioResponseDTO(
                "SUCESSO",
                "Cobrança enviada via WhatsApp com sucesso!");
        return ResponseEntity.ok(resposta);
    }
}
