package com.dev.Backend.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "whatsapp_envio_log")
public class WhatsappEnvioLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cotacao_id", nullable = false)
    private CotacaoServico cotacao;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "telefone_destino", length = 20)
    private String telefoneDestino;

    @Column(name = "mensagem_enviada", columnDefinition = "TEXT")
    private String mensagemEnviada;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_envio", nullable = false)
    private Date dataEnvio;

    @Column(name = "erro_detalhe", columnDefinition = "TEXT")
    private String erroDetalhe;

    @PrePersist
    void prePersist() {
        if (dataEnvio == null) {
            dataEnvio = new Date();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CotacaoServico getCotacao() {
        return cotacao;
    }

    public void setCotacao(CotacaoServico cotacao) {
        this.cotacao = cotacao;
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

    public String getMensagemEnviada() {
        return mensagemEnviada;
    }

    public void setMensagemEnviada(String mensagemEnviada) {
        this.mensagemEnviada = mensagemEnviada;
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
