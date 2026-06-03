package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "simulacao_item")
@Data
@EqualsAndHashCode(exclude = "simulacao")
@ToString(exclude = "simulacao")
public class SimulacaoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_simulacao", nullable = false)
    private Simulacao simulacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_material_disponivel", nullable = false)
    private MaterialDisponivel materialDisponivel;

    @Column(name = "consumo_por_unidade", precision = 12, scale = 4, nullable = false)
    private BigDecimal consumoPorUnidade;

    @Column(name = "consumo_total", precision = 14, scale = 4)
    private BigDecimal consumoTotal;

    @Column(name = "total_com_perda", precision = 14, scale = 4)
    private BigDecimal totalComPerda;

    @Column(name = "quantidade_barras")
    private Integer quantidadeBarras;

    @Column(name = "sobra_estimada", precision = 14, scale = 4)
    private BigDecimal sobraEstimada;

    @Column(name = "preco_unitario_snapshot", precision = 12, scale = 2)
    private BigDecimal precoUnitarioSnapshot;

    @Column(name = "distribuidora_nome_snapshot", length = 200)
    private String distribuidoraNomeSnapshot;

    @Column(name = "custo_estimado", precision = 14, scale = 2)
    private BigDecimal custoEstimado;
}
