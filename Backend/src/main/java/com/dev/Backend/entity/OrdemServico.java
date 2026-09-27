package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "ordem_servico")
@Data
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cotacao", unique = true)
    private CotacaoServico cotacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusOrdemServico status = StatusOrdemServico.ABERTO;

    @Column(name = "estoque_baixado")
    private Boolean estoqueBaixado = false;

    @Column(length = 160)
    private String nome;

    @Column(name = "cliente_nome", length = 160)
    private String clienteNome;

    @Column(length = 40)
    private String telefone;

    @Column(length = 300)
    private String endereco;

    @Column(name = "quantidade_produto")
    private Integer quantidadeProduto = 1;

    @Column(length = 1000)
    private String observacoes;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrdemServicoMaoDeObra> maoDeObra = new ArrayList<>();

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_criacao")
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_atualizacao")
    private Date dataAtualizacao;
}
