package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "cotacao_servico")
@Data
public class CotacaoServico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Pessoa cliente;

    private String clienteNome;
    private String telefone;
    private String endereco;
    private String quantidadeProduto;
    private Double precoUnitario;

    @OneToMany(mappedBy = "cotacaoServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Material> materiais = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "cotacao_distribuidora",
        joinColumns = @JoinColumn(name = "id_cotacao"),
        inverseJoinColumns = @JoinColumn(name = "id_distribuidora")
    )
    private List<Distribuidora> distribuidoras = new ArrayList<>();

    @OneToMany(mappedBy = "cotacaoServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PrecoMaterialCotacao> precosMateriais = new ArrayList<>();

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataAtualizacao;

    @Column(columnDefinition = "TEXT")
    private String analiseEscolhaJson;

    @Column(name = "percentual_insumos", precision = 6, scale = 2)
    private BigDecimal percentualInsumos;

    @Column(name = "valor_frete", precision = 14, scale = 2)
    private BigDecimal valorFrete;

    @Column(name = "total_custo_materiais", precision = 14, scale = 2)
    private BigDecimal totalCustoMateriais;

    @Column(name = "valor_insumos", precision = 14, scale = 2)
    private BigDecimal valorInsumos;

    @Column(name = "percentual_lucro", precision = 6, scale = 2)
    private BigDecimal percentualLucro;

    @Column(name = "valor_lucro", precision = 14, scale = 2)
    private BigDecimal valorLucro;

    @Column(name = "valor_total_orcamento", precision = 14, scale = 2)
    private BigDecimal valorTotalOrcamento;

    @Column(name = "valor_pendente", precision = 15, scale = 2)
    private BigDecimal valorPendente;

    @Temporal(TemporalType.DATE)
    @Column(name = "data_vencimento")
    private Date dataVencimento;
}