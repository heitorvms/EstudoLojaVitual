package com.dev.Backend.dto;

import com.dev.Backend.entity.OrdemServico;
import com.dev.Backend.entity.OrdemServicoMaoDeObra;
import com.dev.Backend.entity.StatusOrdemServico;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class FuncionarioResumoDTO {
    private BigDecimal totalHoras = BigDecimal.ZERO;
    private BigDecimal totalHorasNoturnas = BigDecimal.ZERO;
    private BigDecimal totalValor = BigDecimal.ZERO;
    private BigDecimal totalPago = BigDecimal.ZERO;
    private BigDecimal totalPendente = BigDecimal.ZERO;
    private long totalServicos;
    private List<LancamentoDTO> lancamentos = new ArrayList<>();

    public static FuncionarioResumoDTO from(List<OrdemServicoMaoDeObra> rows) {
        FuncionarioResumoDTO dto = new FuncionarioResumoDTO();
        for (OrdemServicoMaoDeObra m : rows) {
            LancamentoDTO l = LancamentoDTO.from(m);
            dto.lancamentos.add(l);
            dto.totalHoras = dto.totalHoras.add(l.horas);
            if (l.noturno) dto.totalHorasNoturnas = dto.totalHorasNoturnas.add(l.horas);
            dto.totalValor = dto.totalValor.add(l.valorTotal);
            if (l.pago) {
                dto.totalPago = dto.totalPago.add(l.valorTotal);
            } else {
                dto.totalPendente = dto.totalPendente.add(l.valorTotal);
            }
        }
        dto.totalServicos = dto.lancamentos.stream().map(LancamentoDTO::getOrdemServicoId).distinct().count();
        return dto;
    }

    public BigDecimal getTotalHoras() { return totalHoras; }
    public BigDecimal getTotalHorasNoturnas() { return totalHorasNoturnas; }
    public BigDecimal getTotalValor() { return totalValor; }
    public BigDecimal getTotalPago() { return totalPago; }
    public BigDecimal getTotalPendente() { return totalPendente; }
    public long getTotalServicos() { return totalServicos; }
    public List<LancamentoDTO> getLancamentos() { return lancamentos; }

    public static class LancamentoDTO {
        private Long id;
        private Long ordemServicoId;
        private String servicoNome;
        private String clienteNome;
        private StatusOrdemServico status;
        private LocalDate dataTrabalho;
        private boolean noturno;
        private BigDecimal horas;
        private BigDecimal valorHora;
        private BigDecimal valorTotal;
        private boolean pago;
        private LocalDate dataPagamento;

        static LancamentoDTO from(OrdemServicoMaoDeObra m) {
            LancamentoDTO l = new LancamentoDTO();
            OrdemServico os = m.getOrdemServico();
            l.id = m.getId();
            l.ordemServicoId = os.getId();
            l.servicoNome = os.getNome();
            l.clienteNome = os.getClienteNome();
            l.status = os.getStatus();
            l.dataTrabalho = m.getDataTrabalho();
            l.noturno = Boolean.TRUE.equals(m.getNoturno());
            l.horas = m.getHoras() != null ? m.getHoras() : BigDecimal.ZERO;
            l.valorHora = m.getValorHora() != null ? m.getValorHora() : BigDecimal.ZERO;
            l.valorTotal = m.getValorTotal() != null ? m.getValorTotal() : BigDecimal.ZERO;
            l.pago = Boolean.TRUE.equals(m.getPagoFuncionario());
            l.dataPagamento = m.getDataPagamentoFuncionario();
            return l;
        }

        public Long getId() { return id; }
        public Long getOrdemServicoId() { return ordemServicoId; }
        public String getServicoNome() { return servicoNome; }
        public String getClienteNome() { return clienteNome; }
        public StatusOrdemServico getStatus() { return status; }
        public LocalDate getDataTrabalho() { return dataTrabalho; }
        public boolean isNoturno() { return noturno; }
        public BigDecimal getHoras() { return horas; }
        public BigDecimal getValorHora() { return valorHora; }
        public BigDecimal getValorTotal() { return valorTotal; }
        public boolean isPago() { return pago; }
        public LocalDate getDataPagamento() { return dataPagamento; }
    }
}
