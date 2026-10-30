package com.dev.Backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "configuracao_producao")
@Data
public class ConfiguracaoProducao {

    public static final long ID_UNICO = 1L;
    public static final int ESPESSURA_CORTE_PADRAO_MM = 3;
    public static final int RETALHO_MINIMO_PADRAO_MM = 100;

    @Id
    private Long id = ID_UNICO;

    @Column(name = "espessura_corte_mm", nullable = false)
    private Integer espessuraCorteMm = ESPESSURA_CORTE_PADRAO_MM;

    @Column(name = "retalho_minimo_mm", nullable = false)
    private Integer retalhoMinimoMm = RETALHO_MINIMO_PADRAO_MM;
}
