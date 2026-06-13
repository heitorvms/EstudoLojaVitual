package com.dev.Backend.entity;

import java.math.BigDecimal;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Entity
@Table(name = "conta_financeira")
@Data
public class ContaFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoContaFinanceira tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusContaFinanceira status;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", nullable = false, length = 30)
    private FormaPagamento formaPagamento = FormaPagamento.A_VISTA;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal valor;

    @Column(name = "valor_pago", precision = 14, scale = 2)
    private BigDecimal valorPago = BigDecimal.ZERO;

    @Column(length = 500)
    private String descricao;

    @Column(name = "cliente_nome_snapshot", length = 200)
    private String clienteNomeSnapshot;

    @Column(name = "telefone_cliente_snapshot", length = 50)
    private String telefoneClienteSnapshot;

    @Temporal(TemporalType.DATE)
    @Column(name = "data_vencimento")
    private Date dataVencimento;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_pagamento")
    private Date dataPagamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_cotacao", nullable = false)
    private CotacaoServico cotacaoServico;

    @ManyToOne
    @JoinColumn(name = "id_distribuidora")
    private Distribuidora distribuidora;

    @Column(name = "numero_parcela")
    private Integer numeroParcela;

    @Column(name = "total_parcelas")
    private Integer totalParcelas;

    @Column(name = "grupo_parcela", length = 36)
    private String grupoParcela;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_criacao")
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_atualizacao")
    private Date dataAtualizacao;

    @PrePersist
    void prePersist() {
        Date agora = new Date();
        dataCriacao = agora;
        dataAtualizacao = agora;
        if (valorPago == null) {
            valorPago = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void preUpdate() {
        dataAtualizacao = new Date();
    }
}
