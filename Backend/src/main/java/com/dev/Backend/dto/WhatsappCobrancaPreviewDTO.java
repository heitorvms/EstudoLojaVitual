package com.dev.Backend.dto;

import lombok.Data;

@Data
public class WhatsappCobrancaPreviewDTO {
    private Long contaId;
    private String telefone;
    private String mensagem;
    private String linkWhatsapp;
}
