package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public class CotacaoServicoDTO {
    private Long id;
    private String nome;
    private String clienteNome;
    private String telefone;
    private String endereco;
    private String quantidadeProduto;
    private List<MaterialDTO> materiais;

    private List<DistribuidoraDTO> distribuidoras;

    private String analiseEscolhaJson;

    private BigDecimal percentualInsumos;
    private BigDecimal valorFrete;
    private BigDecimal valorInsumos;
    private BigDecimal totalCustoMateriais;
    private BigDecimal percentualLucro;
    private BigDecimal valorLucro;
    private BigDecimal valorTotalOrcamento;

    private Date dataCriacao;
    private Date dataAtualizacao;

    public String getAnaliseEscolhaJson() { return analiseEscolhaJson; }
    public void setAnaliseEscolhaJson(String analiseEscolhaJson) { this.analiseEscolhaJson = analiseEscolhaJson; }

    public Date getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(Date dataCriacao) { this.dataCriacao = dataCriacao; }
    public Date getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(Date dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getClienteNome() { return clienteNome; }
    public void setClienteNome(String clienteNome) { this.clienteNome = clienteNome; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getQuantidadeProduto() { return quantidadeProduto; }
    public void setQuantidadeProduto(String quantidadeProduto) { this.quantidadeProduto = quantidadeProduto; }
    public List<MaterialDTO> getMateriais() { return materiais; }
    public void setMateriais(List<MaterialDTO> materiais) { this.materiais = materiais; }
    public List<DistribuidoraDTO> getDistribuidoras() { return distribuidoras; }
    public void setDistribuidoras(List<DistribuidoraDTO> distribuidoras) { this.distribuidoras = distribuidoras; }
    public BigDecimal getPercentualInsumos() { return percentualInsumos; }
    public void setPercentualInsumos(BigDecimal percentualInsumos) { this.percentualInsumos = percentualInsumos; }
    public BigDecimal getValorFrete() { return valorFrete; }
    public void setValorFrete(BigDecimal valorFrete) { this.valorFrete = valorFrete; }
    public BigDecimal getValorInsumos() { return valorInsumos; }
    public void setValorInsumos(BigDecimal valorInsumos) { this.valorInsumos = valorInsumos; }
    public BigDecimal getTotalCustoMateriais() { return totalCustoMateriais; }
    public void setTotalCustoMateriais(BigDecimal totalCustoMateriais) { this.totalCustoMateriais = totalCustoMateriais; }
    public BigDecimal getPercentualLucro() { return percentualLucro; }
    public void setPercentualLucro(BigDecimal percentualLucro) { this.percentualLucro = percentualLucro; }
    public BigDecimal getValorLucro() { return valorLucro; }
    public void setValorLucro(BigDecimal valorLucro) { this.valorLucro = valorLucro; }
    public BigDecimal getValorTotalOrcamento() { return valorTotalOrcamento; }
    public void setValorTotalOrcamento(BigDecimal valorTotalOrcamento) { this.valorTotalOrcamento = valorTotalOrcamento; }
}