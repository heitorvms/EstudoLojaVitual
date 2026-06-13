package com.dev.Backend.dto;

import com.dev.Backend.entity.TipoDisparoCobranca;

import lombok.Data;

@Data
public class RegistrarCobrancaWhatsappDTO {
    private TipoDisparoCobranca tipo = TipoDisparoCobranca.ABERTURA_WHATSAPP;
}
