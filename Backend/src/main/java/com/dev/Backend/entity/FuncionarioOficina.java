package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "funcionario_oficina")
@Data
public class FuncionarioOficina {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 30)
    private String telefone;

    @Column(length = 60)
    private String cargo;

    @Column(name = "valor_hora", precision = 12, scale = 2, nullable = false)
    private BigDecimal valorHora = BigDecimal.ZERO;

    @Column(name = "valor_hora_noturno", precision = 12, scale = 2)
    private BigDecimal valorHoraNoturno = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_criacao")
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_atualizacao")
    private Date dataAtualizacao;
}
