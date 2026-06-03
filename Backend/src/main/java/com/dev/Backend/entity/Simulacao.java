package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "simulacao")
@Data
public class Simulacao {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "nome_trabalho", length = 120)
    private String nomeTrabalho;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "percentual_perda", precision = 6, scale = 2, nullable = false)
    private BigDecimal percentualPerda;

    @Column(name = "total_custo_estimado", precision = 14, scale = 2)
    private BigDecimal totalCustoEstimado;

    @Column(name = "percentual_insumos", precision = 6, scale = 2)
    private BigDecimal percentualInsumos;

    @Column(name = "valor_frete", precision = 14, scale = 2)
    private BigDecimal valorFrete;

    @Column(name = "total_custo_materiais", precision = 14, scale = 2)
    private BigDecimal totalCustoMateriais;

    @Column(name = "valor_insumos", precision = 14, scale = 2)
    private BigDecimal valorInsumos;

    @OneToMany(
        mappedBy = "simulacao",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<SimulacaoItem> itens = new ArrayList<>();

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private Date dataCriacao;
}
