package com.dev.Backend.dto;

import java.math.BigDecimal;
import com.dev.Backend.entity.OrigemPreco;
import lombok.Data;

@Data
public class RegistrarPrecoDTO {
    private Long materialDisponivelId;
    private Long distribuidoraId;
    private BigDecimal precoUnitario;
    private Integer prazoEntregaDias;
    private String observacao;
    private OrigemPreco origem;
}
