package com.dev.Backend.controller;

import com.dev.Backend.entity.PrecoMaterialCotacao;
import com.dev.Backend.service.PrecoMaterialCotacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/precos-materiais-cotacao")
@CrossOrigin(origins = "http://localhost:3000/")
public class PrecoMaterialCotacaoController {

    @Autowired
    private PrecoMaterialCotacaoService service;

    @GetMapping
    public ResponseEntity<List<PrecoMaterialCotacao>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<PrecoMaterialCotacao> create(@RequestBody PrecoMaterialCotacao preco) {
        return ResponseEntity.ok(service.save(preco));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrecoMaterialCotacao> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrecoMaterialCotacao> update(@PathVariable Long id, @RequestBody PrecoMaterialCotacao preco) {
        return ResponseEntity.ok(service.update(id, preco));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}