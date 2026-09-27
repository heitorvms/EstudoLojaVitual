package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "movimentacao_estoque")
@Data
public class MovimentacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material_disponivel", nullable = false)
    private MaterialDisponivel materialDisponivel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoMovimentacaoEstoque tipo;

    @Column(name = "quantidade_kg", precision = 14, scale = 4)
    private BigDecimal quantidadeKg = BigDecimal.ZERO;

    @Column(name = "metros", precision = 14, scale = 4)
    private BigDecimal metros = BigDecimal.ZERO;

    private Integer barras = 0;

    @Column(length = 300)
    private String referencia;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_movimentacao", nullable = false)
    private Date dataMovimentacao;
}
