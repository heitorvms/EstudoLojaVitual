package com.dev.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "simulacao_item_peca")
@Data
@EqualsAndHashCode(exclude = "simulacaoItem")
@ToString(exclude = "simulacaoItem")
public class SimulacaoItemPeca {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_simulacao_item", nullable = false)
    private SimulacaoItem simulacaoItem;

    @Column(length = 80)
    private String descricao;

    @Column(name = "comprimento_mm", nullable = false)
    private Integer comprimentoMm;

    /** Quantidade da peça por unidade produzida. */
    @Column(nullable = false)
    private Integer quantidade;
}
