package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Categoria;
import com.dev.Backend.repository.CategoriaReposotory;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaReposotory categoriaReposotory;

    public List<Categoria> buscarTodos() {
        return categoriaReposotory.findAll();
    }

    public Categoria inserir(Categoria categoria) {
        categoria.setDataCriacao(new Date());
        Categoria categoriaNovo = categoriaReposotory.saveAndFlush(categoria);
        return categoriaNovo;
    }

    public Categoria alterar(Categoria categoria) {
        categoria.setDataAtualizacao(new Date());
        return categoriaReposotory.saveAndFlush(categoria);
    }

    public void excluir(Long id) {
        Categoria categoria = categoriaReposotory.findById(id).get();
        categoriaReposotory.delete(categoria);
    }
}
