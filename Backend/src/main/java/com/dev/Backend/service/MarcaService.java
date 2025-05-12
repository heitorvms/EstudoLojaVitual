package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Marca;
import com.dev.Backend.repository.MarcaReposototy;

@Service
public class MarcaService {

    @Autowired
    private MarcaReposototy marcaReposotory;

    public List<Marca> buscarTodos() {
        return marcaReposotory.findAll();
    }

    public Marca inserir(Marca marca) {
        marca.setDataCriacao(new Date());
        Marca marcaNovo = marcaReposotory.saveAndFlush(marca);
        return marcaNovo;
    }

    public Marca alterar(Marca marca) {
        marca.setDataAtualizacao(new Date());
        return marcaReposotory.saveAndFlush(marca);
    }

    public void excluir(Long id) {
        Marca marca = marcaReposotory.findById(id).get();
        marcaReposotory.delete(marca);
    }
}