package com.dev.Backend.dto;

import java.util.Date;
import java.util.List;

public class CotacaoServicoDTO {
    private Long id;
    private String nome;
    private String clienteNome;
    private String telefone;
    private String quantidadeProduto;
    private List<MaterialDTO> materiais;

    private List<DistribuidoraDTO> distribuidoras;

    private String analiseEscolhaJson;

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
    public String getQuantidadeProduto() { return quantidadeProduto; }
    public void setQuantidadeProduto(String quantidadeProduto) { this.quantidadeProduto = quantidadeProduto; }
    public List<MaterialDTO> getMateriais() { return materiais; }
    public void setMateriais(List<MaterialDTO> materiais) { this.materiais = materiais; }
    public List<DistribuidoraDTO> getDistribuidoras() { return distribuidoras; }
    public void setDistribuidoras(List<DistribuidoraDTO> distribuidoras) { this.distribuidoras = distribuidoras; }
}