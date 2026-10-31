package com.dev.Backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "compra_lote")
@Data
public class CompraLote {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_distribuidora")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Distribuidora distribuidora;

    @Column(name = "id_cotacao")
    private Long cotacaoId;

    @Temporal(TemporalType.DATE)
    @Column(name = "data_compra", nullable = false)
    private Date dataCompra;

    @Column(name = "numero_nota", length = 60)
    private String numeroNota;

    @Column(length = 500)
    private String observacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusCompraLote status = StatusCompraLote.ATIVA;

    @Column(name = "motivo_cancelamento", length = 500)
    private String motivoCancelamento;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_cancelamento")
    private Date dataCancelamento;

    @Column(name = "valor_total", precision = 14, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @OneToMany(mappedBy = "compraLote", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<CompraLoteItem> itens = new ArrayList<>();

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_criacao")
    private Date dataCriacao;
}
