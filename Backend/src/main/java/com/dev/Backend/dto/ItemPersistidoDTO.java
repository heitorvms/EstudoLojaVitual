package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ItemPersistidoDTO {
    private Long id;
    private Long materialDisponivelId;
    private BigDecimal consumoPorUnidade;
    private List<PecaCorteDTO> pecas = new ArrayList<>();
}
