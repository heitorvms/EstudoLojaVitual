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

    /** Metros lineares necessários (quando aplicável). */
    @Column(name = "metros", precision = 12, scale = 4)
    private java.math.BigDecimal metros;

    /** Peso estimado em kg. */
    @Column(name = "peso_kg", precision = 12, scale = 4)
    private java.math.BigDecimal pesoKg;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataAtualizacao;
}