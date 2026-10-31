package com.dev.Backend.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.dev.Backend.entity.CategoriaContaFinanceira;
import com.dev.Backend.entity.StatusContaFinanceira;
import com.dev.Backend.entity.TipoContaFinanceira;

public record FiltroContaFinanceiraDTO(
        TipoContaFinanceira tipo,
        StatusContaFinanceira status,
        CategoriaContaFinanceira categoria,
        String busca,
        Long cotacaoId,
        Long ordemServicoId,
        Long compraLoteId,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate vencimentoDe,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate vencimentoAte) {
}
