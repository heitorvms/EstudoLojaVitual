package com.dev.Backend.dto;

import java.util.List;

public class CotacaoServicoInputDTO {
    private String nome;
    private String clienteNome;
    private String telefone;
    private Integer quantidadeProduto;
    private List<MaterialInputDTO> materiais;
    private List<DistribuidoraInputDTO> distribuidoras;
    private List<PrecoMaterialInputDTO> precosMateriais;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getClienteNome() { return clienteNome; }
    public void setClienteNome(String clienteNome) { this.clienteNome = clienteNome; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public Integer getQuantidadeProduto() { return quantidadeProduto; }
    public void setQuantidadeProduto(Integer quantidadeProduto) { this.quantidadeProduto = quantidadeProduto; }
    public List<MaterialInputDTO> getMateriais() { return materiais; }
    public void setMateriais(List<MaterialInputDTO> materiais) { this.materiais = materiais; }
    public List<DistribuidoraInputDTO> getDistribuidoras() { return distribuidoras; }
    public void setDistribuidoras(List<DistribuidoraInputDTO> distribuidoras) { this.distribuidoras = distribuidoras; }
    public List<PrecoMaterialInputDTO> getPrecosMateriais() { return precosMateriais; }
    public void setPrecosMateriais(List<PrecoMaterialInputDTO> precosMateriais) { this.precosMateriais = precosMateriais; }
}


