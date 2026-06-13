package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class CotacaoServicoInputDTO {
    private String nome;
    private Long clienteId;
    private String clienteNome;
    private String telefone;
    private String endereco;
    private Integer quantidadeProduto;
    private List<MaterialInputDTO> materiais;
    private List<DistribuidoraInputDTO> distribuidoras;

    private List<PrecoMaterialInputDTO> precosMateriais;

    private String analiseEscolhaJson;

    private BigDecimal percentualInsumos;
    private BigDecimal valorFrete;
    private BigDecimal valorInsumos;
    private BigDecimal totalCustoMateriais;
    private BigDecimal percentualLucro;
    private BigDecimal valorLucro;
    private BigDecimal valorTotalOrcamento;

    public String getAnaliseEscolhaJson() { return analiseEscolhaJson; }
    public void setAnaliseEscolhaJson(String analiseEscolhaJson) { this.analiseEscolhaJson = analiseEscolhaJson; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
    public String getClienteNome() { return clienteNome; }
    public void setClienteNome(String clienteNome) { this.clienteNome = clienteNome; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public Integer getQuantidadeProduto() { return quantidadeProduto; }
    public void setQuantidadeProduto(Integer quantidadeProduto) { this.quantidadeProduto = quantidadeProduto; }
    public List<MaterialInputDTO> getMateriais() { return materiais; }
    public void setMateriais(List<MaterialInputDTO> materiais) { this.materiais = materiais; }
    public List<DistribuidoraInputDTO> getDistribuidoras() { return distribuidoras; }
    public void setDistribuidoras(List<DistribuidoraInputDTO> distribuidoras) { this.distribuidoras = distribuidoras; }
    public List<PrecoMaterialInputDTO> getPrecosMateriais() { return precosMateriais; }
    public void setPrecosMateriais(List<PrecoMaterialInputDTO> precosMateriais) { this.precosMateriais = precosMateriais; }
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