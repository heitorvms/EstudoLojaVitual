package com.dev.Backend.dto;

import java.util.ArrayList;
import java.util.List;

public class UsuarioPermissaoDTO {
    private Long id;
    private String nome;
    private String email;
    private List<String> permissoes = new ArrayList<>();
    

    public UsuarioPermissaoDTO(Long id, String nome, String email, List<String> permissoes) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.permissoes = new ArrayList<>(permissoes);
    }
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public List<String> getPermissoes() { return permissoes; }
}

