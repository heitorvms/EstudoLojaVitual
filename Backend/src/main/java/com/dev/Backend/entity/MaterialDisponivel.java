package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "material_disponivel")
@Data
public class MaterialDisponivel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String descricao;

    @Column(precision = 12, scale = 4)
    private BigDecimal tamanho;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UnidadeMaterial unidade = UnidadeMaterial.BARRA;

    /** Comprimento padrão da barra em mm (ex: 6000). */
    @Column(name = "comprimento_barra_mm")
    private Integer comprimentoBarraMm = 6000;

    /** Peso em kg por metro linear. */
    @Column(name = "peso_kg_por_metro", precision = 12, scale = 4)
    private BigDecimal pesoKgPorMetro = BigDecimal.ZERO;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataAtualizacao;
}
