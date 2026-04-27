package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

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
    private String clienteNome;
    private String telefone;
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
}