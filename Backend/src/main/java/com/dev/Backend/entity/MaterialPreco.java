package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(
    name = "material_preco",
    indexes = {
        @Index(name = "idx_mp_material_dist_vigente",
               columnList = "id_material_disponivel,id_distribuidora,data_fim")
    }
)
@Data
@EqualsAndHashCode(exclude = {"materialDisponivel", "distribuidora"})
@ToString(exclude = {"materialDisponivel", "distribuidora"})
public class MaterialPreco {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_material_disponivel", nullable = false)
    private MaterialDisponivel materialDisponivel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_distribuidora", nullable = false)
    private Distribuidora distribuidora;

    @Column(name = "preco_unitario", precision = 12, scale = 2, nullable = false)
    private BigDecimal precoUnitario;

    @Column(name = "prazo_entrega_dias")
    private Integer prazoEntregaDias;

    @Column(length = 255)
    private String observacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrigemPreco origem;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_inicio", nullable = false)
    private Date dataInicio;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_fim")
    private Date dataFim;
}
