package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "material")
@Data
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_material_disponivel")
    private MaterialDisponivel materialDisponivel;

    @ManyToOne
    @JoinColumn(name = "id_cotacao")
    private CotacaoServico cotacaoServico;

    private Integer quantidade;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataAtualizacao;
}