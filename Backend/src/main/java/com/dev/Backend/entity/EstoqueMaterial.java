package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "estoque_material")
@Data
public class EstoqueMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material_disponivel", nullable = false, unique = true)
    private MaterialDisponivel materialDisponivel;

    @Column(name = "quantidade_kg", precision = 14, scale = 4, nullable = false)
    private BigDecimal quantidadeKg = BigDecimal.ZERO;

    @Column(name = "metros", precision = 14, scale = 4, nullable = false)
    private BigDecimal metros = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer barras = 0;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_atualizacao")
    private Date dataAtualizacao;
}
