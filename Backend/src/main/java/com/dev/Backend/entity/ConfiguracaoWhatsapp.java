package com.dev.Backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "configuracao_whatsapp")
@Data
public class ConfiguracaoWhatsapp {

    public static final long ID_UNICO = 1L;

    @Id
    private Long id = ID_UNICO;

    @Column(name = "mensagem_orcamento", columnDefinition = "TEXT", nullable = false)
    private String mensagemOrcamento;

    @Column(name = "mensagem_cobranca", columnDefinition = "TEXT", nullable = false)
    private String mensagemCobranca;
}
