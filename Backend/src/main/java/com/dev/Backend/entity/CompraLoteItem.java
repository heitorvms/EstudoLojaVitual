package com.dev.Backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "compra_lote_item")
@Data
public class CompraLoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_compra_lote", nullable = false)
    @JsonIgnoreProperties({"itens", "hibernateLazyInitializer", "handler"})
    private CompraLote compraLote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material_disponivel", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private MaterialDisponivel materialDisponivel;

    @ManyToOne
    @JoinColumn(name = "id_distribuidora")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Distribuidora distribuidora;

    @Column(name = "metros", precision = 14, scale = 4)
    private BigDecimal metros = BigDecimal.ZERO;

    @Column(name = "barras")
    private Integer barras = 0;

    @Column(name = "valor_barra", precision = 14, scale = 2)
    private BigDecimal valorBarra = BigDecimal.ZERO;

    @Column(name = "valor_total", precision = 14, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;
}
