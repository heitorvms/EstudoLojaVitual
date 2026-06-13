package com.dev.Backend.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Entity
@Table(name = "cobranca_whatsapp_historico")
@Data
public class CobrancaWhatsappHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_conta", nullable = false)
    private ContaFinanceira conta;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensagem;

    @Column(length = 30)
    private String telefone;

    @Column(name = "link_whatsapp", length = 2000)
    private String linkWhatsapp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoDisparoCobranca tipo;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_disparo", nullable = false)
    private Date dataDisparo;

    @PrePersist
    void prePersist() {
        if (dataDisparo == null) {
            dataDisparo = new Date();
        }
    }
}
