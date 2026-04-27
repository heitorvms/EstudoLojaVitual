package com.dev.Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.entity.Cidade;
import com.dev.Backend.service.CidadeService;

@RestController
@RequestMapping("/api/cidade")
@CrossOrigin("http://localhost:3000/")
public class CidadeController {

    @Autowired
    private CidadeService cidadeService;

    @GetMapping("/")
    public Page<Cidade> buscarTodos(Pageable pageable) {
        return cidadeService.buscarTodos(pageable);
    }

    @GetMapping("/buscarPorNome")
    public Page<Cidade> buscarPorNome(
            @RequestParam String nome,
            Pageable pageable) {
        return cidadeService.buscarPorNome(nome, pageable);
    }

    @GetMapping("/estado/{estadoId}")
    public Page<Cidade> buscarPorEstado(
            @PathVariable("estadoId") Long estadoId,
            Pageable pageable) {
        return cidadeService.buscarPorEstado(estadoId, pageable);
    }

    @PostMapping("/")
    public Cidade inserir(@RequestBody Cidade cidade) {
        return cidadeService.inserir(cidade);
    }

    @PutMapping("/{id}")
    public Cidade alterar(@RequestBody Cidade cidade) {
        return cidadeService.alterar(cidade);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id) {
        cidadeService.excluir(id);
        return ResponseEntity.ok().build();
    }
}