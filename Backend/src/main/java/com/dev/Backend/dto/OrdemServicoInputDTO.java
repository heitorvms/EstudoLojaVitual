package com.dev.Backend.dto;

import com.dev.Backend.entity.StatusOrdemServico;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class OrdemServicoInputDTO {
    private StatusOrdemServico status;
    private String observacoes;
    private List<MaoDeObraInputDTO> maoDeObra;
    private Boolean devolverEstoque;
    private GerarContasFinanceirasDTO financeiro;

    public StatusOrdemServico getStatus() { return status; }
    public void setStatus(StatusOrdemServico status) { this.status = status; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public List<MaoDeObraInputDTO> getMaoDeObra() { return maoDeObra; }
    public void setMaoDeObra(List<MaoDeObraInputDTO> maoDeObra) { this.maoDeObra = maoDeObra; }
    public Boolean getDevolverEstoque() { return devolverEstoque; }
    public void setDevolverEstoque(Boolean devolverEstoque) { this.devolverEstoque = devolverEstoque; }
    public GerarContasFinanceirasDTO getFinanceiro() { return financeiro; }
    public void setFinanceiro(GerarContasFinanceirasDTO financeiro) { this.financeiro = financeiro; }

    public static class MaoDeObraInputDTO {
        private Long id;
        private Long funcionarioId;
        private Boolean noturno;
        private LocalDate dataTrabalho;
        private BigDecimal horas;
        private BigDecimal valorHora;
        private String observacao;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getFuncionarioId() { return funcionarioId; }
        public void setFuncionarioId(Long funcionarioId) { this.funcionarioId = funcionarioId; }
        public Boolean getNoturno() { return noturno; }
        public void setNoturno(Boolean noturno) { this.noturno = noturno; }
        public LocalDate getDataTrabalho() { return dataTrabalho; }
        public void setDataTrabalho(LocalDate dataTrabalho) { this.dataTrabalho = dataTrabalho; }
        public BigDecimal getHoras() { return horas; }
        public void setHoras(BigDecimal horas) { this.horas = horas; }
        public BigDecimal getValorHora() { return valorHora; }
        public void setValorHora(BigDecimal valorHora) { this.valorHora = valorHora; }
        public String getObservacao() { return observacao; }
        public void setObservacao(String observacao) { this.observacao = observacao; }
    }
}
