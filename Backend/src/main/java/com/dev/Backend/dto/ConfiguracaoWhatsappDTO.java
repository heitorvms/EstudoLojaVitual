package com.dev.Backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class ConfiguracaoWhatsappDTO {
    private String mensagemOrcamento;
    private String mensagemCobranca;
    private String urlWppconnect;
    private String tokenWppconnect;
    private String nomeSessao;
    private List<PlaceholderWhatsappDTO> placeholdersOrcamento;
    private List<PlaceholderWhatsappDTO> placeholdersCobranca;
}
