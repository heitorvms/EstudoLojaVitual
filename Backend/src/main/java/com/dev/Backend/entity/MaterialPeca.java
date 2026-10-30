package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "material_peca")
@Data
@EqualsAndHashCode(exclude = "material")
@ToString(exclude = "material")
public class MaterialPeca {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_material", nullable = false)
    private Material material;

    @Column(length = 80)
    private String descricao;

    @Column(name = "comprimento_mm", nullable = false)
    private Integer comprimentoMm;

    /** Quantidade total da peça no serviço (já multiplicada pelas unidades). */
    @Column(nullable = false)
    private Integer quantidade;
}
