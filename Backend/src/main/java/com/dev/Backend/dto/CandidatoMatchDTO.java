package com.dev.Backend.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidatoMatchDTO {
    private Long id;
    private String descricao;
    private BigDecimal tamanho;
    private Double similaridade;
}
