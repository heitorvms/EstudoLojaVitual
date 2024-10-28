package com.dev.Backend.entity;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Entity
@Table(name = "produto")
@Data
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idMarca")
    private Marca marca;

    @ManyToOne
    @JoinColumn(name = "idCategoria")
    private Categoria categoria;

    private String descricaoCurta;
    private String descricaoDetalhada;
    private Double valorCusto;
    private Double valorVenda;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCriaca;
    @Temporal(TemporalType.TIMESTAMP)
    private Date dataAtualizacao;

}
