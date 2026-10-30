package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Date;

@Entity
@Table(name = "retalho_estoque")
@Data
@EqualsAndHashCode(exclude = "ordemServico")
@ToString(exclude = "ordemServico")
public class Retalho {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_material_disponivel", nullable = false)
    private MaterialDisponivel materialDisponivel;

    /** OS que gerou o retalho. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ordem_servico")
    private OrdemServico ordemServico;

    @Column(name = "comprimento_mm", nullable = false)
    private Integer comprimentoMm;

    @Column(nullable = false)
    private Integer quantidade;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_criacao")
    private Date dataCriacao;
}
