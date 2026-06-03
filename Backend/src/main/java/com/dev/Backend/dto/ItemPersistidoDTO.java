package com.dev.Backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ItemPersistidoDTO {
    private Long id;
    private Long materialDisponivelId;
    private BigDecimal consumoPorUnidade;
}
