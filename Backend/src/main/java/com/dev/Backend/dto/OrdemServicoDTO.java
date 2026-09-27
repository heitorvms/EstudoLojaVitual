package com.dev.Backend.dto;

import com.dev.Backend.entity.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class OrdemServicoDTO {
    private Long id;
    private Long cotacaoId;
    private StatusOrdemServico status;
    private String nome;
    private String clienteNome;
    private String telefone;
    private String endereco;
    private Integer quantidadeProduto;
    private String observacoes;
    private Date dataCriacao;
    private Date dataAtualizacao;
    private List<MaoDeObraDTO> maoDeObra = new ArrayList<>();
    private List<MaterialUtilizadoDTO> materiais = new ArrayList<>();
    private BigDecimal totalMaoDeObra;
    private Boolean estoqueBaixado;
    private BigDecimal valorOrcamento;
    private BigDecimal valorMaterialCliente;
    private BigDecimal valorMaoDeObraCliente;
    private boolean possuiFinanceiro;
    private boolean materialPago;
    private boolean maoDeObraPago;

    public static OrdemServicoDTO from(OrdemServico o) {
        OrdemServicoDTO dto = new OrdemServicoDTO();
        dto.id = o.getId();
        dto.status = o.getStatus();
        dto.nome = o.getNome();
        dto.clienteNome = o.getClienteNome();
        dto.telefone = o.getTelefone();
        dto.endereco = o.getEndereco();
        dto.quantidadeProduto = o.getQuantidadeProduto();
        dto.observacoes = o.getObservacoes();
        dto.dataCriacao = o.getDataCriacao();
        dto.dataAtualizacao = o.getDataAtualizacao();
        dto.estoqueBaixado = Boolean.TRUE.equals(o.getEstoqueBaixado());
        BigDecimal total = BigDecimal.ZERO;
        for (OrdemServicoMaoDeObra m : o.getMaoDeObra()) {
            dto.maoDeObra.add(MaoDeObraDTO.from(m));
            if (m.getValorTotal() != null) total = total.add(m.getValorTotal());
        }
        dto.totalMaoDeObra = total;
        CotacaoServico cotacao = o.getCotacao();
        if (cotacao != null) {
            dto.cotacaoId = cotacao.getId();
            dto.valorOrcamento = cotacao.getValorTotalOrcamento();
            for (Material m : cotacao.getMateriais()) {
                dto.materiais.add(MaterialUtilizadoDTO.from(m));
            }
        }
        return dto;
    }

    public OrdemServicoDTO comFinanceiro(BigDecimal valorMaterialCliente, BigDecimal valorMaoDeObraCliente,
                                         Boolean materialPago, Boolean maoDeObraPago) {
        this.valorMaterialCliente = valorMaterialCliente;
        this.valorMaoDeObraCliente = valorMaoDeObraCliente;
        this.possuiFinanceiro = materialPago != null || maoDeObraPago != null;
        this.materialPago = Boolean.TRUE.equals(materialPago);
        this.maoDeObraPago = Boolean.TRUE.equals(maoDeObraPago);
        return this;
    }

    public static class MaterialUtilizadoDTO {
        private Long materialDisponivelId;
        private String descricao;
        private Integer quantidade;
        private Integer comprimentoBarraMm;

        static MaterialUtilizadoDTO from(Material m) {
            MaterialUtilizadoDTO dto = new MaterialUtilizadoDTO();
            MaterialDisponivel md = m.getMaterialDisponivel();
            if (md != null) {
                dto.materialDisponivelId = md.getId();
                dto.descricao = md.getDescricao();
                dto.comprimentoBarraMm = md.getComprimentoBarraMm() != null ? md.getComprimentoBarraMm() : 6000;
            }
            dto.quantidade = m.getQuantidade();
            return dto;
        }

        public Long getMaterialDisponivelId() { return materialDisponivelId; }
        public String getDescricao() { return descricao; }
        public Integer getQuantidade() { return quantidade; }
        public Integer getComprimentoBarraMm() { return comprimentoBarraMm; }
    }

    public Long getId() { return id; }
    public Long getCotacaoId() { return cotacaoId; }
    public StatusOrdemServico getStatus() { return status; }
    public String getNome() { return nome; }
    public String getClienteNome() { return clienteNome; }
    public String getTelefone() { return telefone; }
    public String getEndereco() { return endereco; }
    public Integer getQuantidadeProduto() { return quantidadeProduto; }
    public String getObservacoes() { return observacoes; }
    public Date getDataCriacao() { return dataCriacao; }
    public Date getDataAtualizacao() { return dataAtualizacao; }
    public List<MaoDeObraDTO> getMaoDeObra() { return maoDeObra; }
    public List<MaterialUtilizadoDTO> getMateriais() { return materiais; }
    public BigDecimal getTotalMaoDeObra() { return totalMaoDeObra; }
    public Boolean getEstoqueBaixado() { return estoqueBaixado; }
    public BigDecimal getValorOrcamento() { return valorOrcamento; }
    public BigDecimal getValorMaterialCliente() { return valorMaterialCliente; }
    public BigDecimal getValorMaoDeObraCliente() { return valorMaoDeObraCliente; }
    public boolean isPossuiFinanceiro() { return possuiFinanceiro; }
    public boolean isMaterialPago() { return materialPago; }
    public boolean isMaoDeObraPago() { return maoDeObraPago; }
}
