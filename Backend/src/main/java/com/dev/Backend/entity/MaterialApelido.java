package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Date;

@Entity
@Table(
    name = "material_apelido",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_apelido_dist_descricao",
            columnNames = {"id_distribuidora", "descricao_normalizada"}
        )
    },
    indexes = {
        @Index(name = "idx_apelido_dist_norm",
               columnList = "id_distribuidora,descricao_normalizada")
    }
)
@Data
@EqualsAndHashCode(exclude = {"materialDisponivel", "distribuidora"})
@ToString(exclude = {"materialDisponivel", "distribuidora"})
public class MaterialApelido {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_material_disponivel", nullable = false)
    private MaterialDisponivel materialDisponivel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_distribuidora", nullable = false)
    private Distribuidora distribuidora;

    @Column(name = "descricao_no_fornecedor", length = 255, nullable = false)
    private String descricaoNoFornecedor;

    @Column(name = "descricao_normalizada", length = 255, nullable = false)
    private String descricaoNormalizada;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private Date dataCriacao;
}
