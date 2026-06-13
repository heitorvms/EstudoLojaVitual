package com.dev.Backend.dto;

public class WppConnectMensagemDTO {

    private String mensagem;

    public WppConnectMensagemDTO() {
    }

    public WppConnectMensagemDTO(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
}
