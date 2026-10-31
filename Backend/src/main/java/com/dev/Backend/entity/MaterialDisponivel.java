package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

    /** Derivado de {@link #tamanho}, que é o valor editado no cadastro. */
    @Column(name = "comprimento_barra_mm")
    private Integer comprimentoBarraMm = 6000;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataAtualizacao;

    @PrePersist
    @PreUpdate
    private void sincronizarComprimentoBarra() {
        if (tamanho != null && tamanho.signum() > 0) {
            comprimentoBarraMm = tamanho.movePointRight(3).setScale(0, RoundingMode.HALF_UP).intValue();
        }
    }
}
