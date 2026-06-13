package com.dev.Backend.dto;

import java.util.Date;

import com.dev.Backend.entity.TipoDisparoCobranca;

import lombok.Data;

@Data
public class CobrancaHistoricoDTO {
    private Long id;
    private Long contaId;
    private String mensagem;
    private String telefone;
    private String linkWhatsapp;
    private TipoDisparoCobranca tipo;
    private Date dataDisparo;
}
