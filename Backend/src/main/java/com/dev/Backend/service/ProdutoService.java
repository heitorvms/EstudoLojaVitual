package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Produto;
import com.dev.Backend.repository.ProdutoReposotory;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoReposotory produtoReposotory;

    public List<Produto> buscarTodos() {
        return produtoReposotory.findAll();
    }

    public Produto inserir(Produto produto) {
        produto.setDataCriaca(new Date());
        Produto produtoNovo = produtoReposotory.saveAndFlush(produto);
        return produtoNovo;
    }

    public Produto alterar(Produto produto) {
        produto.setDataAtualizacao(new Date());
        return produtoReposotory.saveAndFlush(produto);
    }

    public void excluir(Long id) {
        Produto produto = produtoReposotory.findById(id).get();
        produtoReposotory.delete(produto);
    }
}
