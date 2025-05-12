package com.dev.Backend.service;

import java.util.List;
import java.util.Date;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dev.Backend.entity.Produto;
import com.dev.Backend.entity.ProdutoImagens;
import com.dev.Backend.repository.ProdutoImagensReposotory;
import com.dev.Backend.repository.ProdutoReposotory;

@Service
public class ProdutoImagensService {

    @Autowired
    private ProdutoImagensReposotory produtoImagensReposotory;

    @Autowired
    private ProdutoReposotory produtoReposotory;

    public List<ProdutoImagens> buscarTodos() {
        return produtoImagensReposotory.findAll();
    }

    public ProdutoImagens inserir(Long idProduto, MultipartFile file) {
        Produto produto = produtoReposotory.findById(idProduto).get();
        ProdutoImagens produtoImagens = new ProdutoImagens();

        try {
            if (!file.isEmpty()) {
                byte[] bytes = file.getBytes();
                String nomeImagem = String.valueOf(produto.getId()) + file.getOriginalFilename();
                Path caminho = Paths
                        .get("c:/imagens/" + nomeImagem);
                Files.write(caminho, bytes);
                produtoImagens.setNome(nomeImagem);

            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        produtoImagens.setProduto(produto);
        produtoImagens.setDataCriacao(new Date());
        produtoImagens = produtoImagensReposotory.saveAndFlush(produtoImagens);
        return produtoImagens;
    }

    public ProdutoImagens alterar(ProdutoImagens produtoimagens) {
        produtoimagens.setDataAtualizacao(new Date());
        return produtoImagensReposotory.saveAndFlush(produtoimagens);
    }

    public void excluir(Long id) {
        ProdutoImagens produtoimagens = produtoImagensReposotory.findById(id).get();
        produtoImagensReposotory.delete(produtoimagens);
    }

}
