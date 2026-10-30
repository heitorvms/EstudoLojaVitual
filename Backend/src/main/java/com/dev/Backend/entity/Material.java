package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "material")
@Data
@EqualsAndHashCode(exclude = "pecas")
@ToString(exclude = "pecas")
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

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("comprimentoMm DESC")
    private List<MaterialPeca> pecas = new ArrayList<>();

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataAtualizacao;
}
