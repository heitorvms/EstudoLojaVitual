package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name = "ordem_servico_mao_obra")
@Data
public class OrdemServicoMaoDeObra {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ordem_servico", nullable = false)
    private OrdemServico ordemServico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_funcionario")
    private FuncionarioOficina funcionario;

    @Column
    private Boolean noturno = false;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal horas = BigDecimal.ZERO;

    @Column(name = "valor_hora", precision = 12, scale = 2, nullable = false)
    private BigDecimal valorHora = BigDecimal.ZERO;

    @Column(name = "valor_total", precision = 14, scale = 2, nullable = false)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @Column(length = 300)
    private String observacao;

    @Column(name = "data_trabalho")
    private LocalDate dataTrabalho;

    @Column(name = "pago_funcionario")
    private Boolean pagoFuncionario = false;

    @Column(name = "data_pagamento_funcionario")
    private LocalDate dataPagamentoFuncionario;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_criacao")
    private Date dataCriacao;
}
