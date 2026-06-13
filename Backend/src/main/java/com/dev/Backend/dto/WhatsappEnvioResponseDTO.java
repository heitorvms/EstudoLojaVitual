package com.dev.Backend.dto;

public class WhatsappEnvioResponseDTO {

    private String status;
    private String mensagem;

    public WhatsappEnvioResponseDTO() {
    }

    public WhatsappEnvioResponseDTO(String status, String mensagem) {
        this.status = status;
        this.mensagem = mensagem;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
}
