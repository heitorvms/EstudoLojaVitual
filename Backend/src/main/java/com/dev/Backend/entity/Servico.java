package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "servico")
@Data
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idCliente")
    private Pessoa cliente;

    @ManyToMany
    @JoinTable(
        name = "servico_material",
        joinColumns = @JoinColumn(name = "idServico"),
        inverseJoinColumns = @JoinColumn(name = "idMaterial")
    )
    private List<Material> materiais = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "servico_distribuidora",
        joinColumns = @JoinColumn(name = "idServico"),
        inverseJoinColumns = @JoinColumn(name = "idDistribuidora")
    )
    private List<Distribuidora> distribuidoras = new ArrayList<>();

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCriacao;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataAtualizacao;
}