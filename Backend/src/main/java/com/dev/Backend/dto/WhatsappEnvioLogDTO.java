package com.dev.Backend.dto;

import java.util.Date;

public class WhatsappEnvioLogDTO {

    private Long id;
    private String status;
    private String telefoneDestino;
    private Date dataEnvio;
    private String erroDetalhe;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTelefoneDestino() {
        return telefoneDestino;
    }

    public void setTelefoneDestino(String telefoneDestino) {
        this.telefoneDestino = telefoneDestino;
    }

    public Date getDataEnvio() {
        return dataEnvio;
    }

    public void setDataEnvio(Date dataEnvio) {
        this.dataEnvio = dataEnvio;
    }

    public String getErroDetalhe() {
        return erroDetalhe;
    }

    public void setErroDetalhe(String erroDetalhe) {
        this.erroDetalhe = erroDetalhe;
    }
}
