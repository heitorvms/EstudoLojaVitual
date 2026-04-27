package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "preco_material_cotacao")
@Data
public class PrecoMaterialCotacao {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_cotacao")
    private CotacaoServico cotacaoServico;

    @ManyToOne
    @JoinColumn(name = "id_distribuidora")
    private Distribuidora distribuidora;

    @ManyToOne
    @JoinColumn(name = "id_material")
    private Material material;

    private Double preco;
}