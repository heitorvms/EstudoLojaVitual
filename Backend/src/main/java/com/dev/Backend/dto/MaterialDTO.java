package com.dev.Backend.dto;

import java.util.List;

public class MaterialDTO {
    private Long id;
    private String quantidade;
    private MaterialDisponivelDTO materialDisponivel;
    private List<PrecoMaterialCotacaoDTO> precos;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuantidade() { return quantidade; }
    public void setQuantidade(String quantidade) { this.quantidade = quantidade; }
    public MaterialDisponivelDTO getMaterialDisponivel() { return materialDisponivel; }
    public void setMaterialDisponivel(MaterialDisponivelDTO materialDisponivel) { this.materialDisponivel = materialDisponivel; }
    public List<PrecoMaterialCotacaoDTO> getPrecos() { return precos; }
    public void setPrecos(List<PrecoMaterialCotacaoDTO> precos) { this.precos = precos; }
}