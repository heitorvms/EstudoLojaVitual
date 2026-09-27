package com.dev.Backend.dto;

import com.dev.Backend.entity.OrdemServicoMaoDeObra;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MaoDeObraDTO {
    private Long id;
    private Long funcionarioId;
    private String funcionarioNome;
    private Boolean noturno;
    private LocalDate dataTrabalho;
    private BigDecimal horas;
    private BigDecimal valorHora;
    private BigDecimal valorTotal;
    private String observacao;
    private Boolean pagoFuncionario;

    public static MaoDeObraDTO from(OrdemServicoMaoDeObra m) {
        MaoDeObraDTO dto = new MaoDeObraDTO();
        dto.id = m.getId();
        if (m.getFuncionario() != null) {
            dto.funcionarioId = m.getFuncionario().getId();
            dto.funcionarioNome = m.getFuncionario().getNome();
        }
        dto.noturno = Boolean.TRUE.equals(m.getNoturno());
        dto.dataTrabalho = m.getDataTrabalho();
        dto.horas = m.getHoras();
        dto.valorHora = m.getValorHora();
        dto.valorTotal = m.getValorTotal();
        dto.observacao = m.getObservacao();
        dto.pagoFuncionario = Boolean.TRUE.equals(m.getPagoFuncionario());
        return dto;
    }

    public Long getId() { return id; }
    public Long getFuncionarioId() { return funcionarioId; }
    public String getFuncionarioNome() { return funcionarioNome; }
    public Boolean getNoturno() { return noturno; }
    public LocalDate getDataTrabalho() { return dataTrabalho; }
    public BigDecimal getHoras() { return horas; }
    public BigDecimal getValorHora() { return valorHora; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public String getObservacao() { return observacao; }
    public Boolean getPagoFuncionario() { return pagoFuncionario; }
}
