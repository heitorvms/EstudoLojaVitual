package com.dev.Backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.WppConnectMensagemDTO;
import com.dev.Backend.dto.WppConnectQrCodeDTO;
import com.dev.Backend.dto.WppConnectStatusDTO;
import com.dev.Backend.service.WppConnectStatusService;

@RestController
@RequestMapping("/api/whatsapp")
@CrossOrigin(origins = "http://localhost:3000")
public class WppConnectController {

    private final WppConnectStatusService wppConnectStatusService;

    public WppConnectController(WppConnectStatusService wppConnectStatusService) {
        this.wppConnectStatusService = wppConnectStatusService;
    }

    @GetMapping("/status")
    @PreAuthorize("hasAnyAuthority('Admin', 'Gerente')")
    public ResponseEntity<WppConnectStatusDTO> status() {
        String status = wppConnectStatusService.obterStatus();
        return ResponseEntity.ok(new WppConnectStatusDTO(status));
    }

    @PostMapping("/conectar")
    @PreAuthorize("hasAnyAuthority('Admin', 'Gerente')")
    public ResponseEntity<WppConnectQrCodeDTO> conectar() {
        String qrcode = wppConnectStatusService.obterQrCode();
        return ResponseEntity.ok(new WppConnectQrCodeDTO(qrcode));
    }

    @PostMapping("/desconectar")
    @PreAuthorize("hasAnyAuthority('Admin', 'Gerente')")
    public ResponseEntity<WppConnectMensagemDTO> desconectar() {
        wppConnectStatusService.desconectar();
        return ResponseEntity.ok(new WppConnectMensagemDTO("Desconectado com sucesso"));
    }
}
