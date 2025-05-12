package com.dev.Backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dev.Backend.entity.Estado;
import com.dev.Backend.service.EstadoService;

@RestController
@RequestMapping("/api/estado")
public class EstadoController {

    @Autowired
    private EstadoService estadoService;

    @GetMapping("/")
    @CrossOrigin("http://localhost:3000/")
    public Page<Estado> buscarTodos(Pageable pageable) {
        return estadoService.buscarTodos(pageable);
    }

    @GetMapping("/buscarPorNome")
    @CrossOrigin("http://localhost:3000/")
    public Page<Estado> buscarPorNome(
            @RequestParam String nome,
            Pageable pageable) {
        return estadoService.buscarPorNome(nome, pageable);
    }

    @PostMapping("/")
    @CrossOrigin("http://localhost:3000/")
    public Estado inserir(@RequestBody Estado estado) {
        return estadoService.inserir(estado);
    }

    @PutMapping("/")
    @CrossOrigin("http://localhost:3000/")
    public Estado alterar(@RequestBody Estado estado) {
        return estadoService.alterar(estado);
    }

    @DeleteMapping("/{id}")
    @CrossOrigin("http://localhost:3000/")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id) {
        estadoService.excluir(id);
        return ResponseEntity.ok().build();
    }
}
