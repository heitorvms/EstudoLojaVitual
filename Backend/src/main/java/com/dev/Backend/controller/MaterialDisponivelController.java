package com.dev.Backend.controller;

import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.service.MaterialDisponivelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materiais-disponiveis")
@CrossOrigin(origins = "http://localhost:3000/")
public class MaterialDisponivelController {

    @Autowired
    private MaterialDisponivelService service;

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaterialDisponivel>> search(@RequestParam String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<MaterialDisponivel> materiais = service.findTop5ByDescricaoContaining(query.trim());
        return ResponseEntity.ok(materiais);
    }

    @GetMapping
    public ResponseEntity<List<MaterialDisponivel>> getAll(@RequestParam(required = false) String query) {
        List<MaterialDisponivel> materiais = service.findAll(query);
        return ResponseEntity.ok(materiais);
    }

    @PostMapping
    public ResponseEntity<MaterialDisponivel> create(@RequestBody MaterialDisponivel material) {
        return ResponseEntity.ok(service.save(material));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialDisponivel> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialDisponivel> update(@PathVariable Long id, @RequestBody MaterialDisponivel material) {
        return ResponseEntity.ok(service.update(id, material));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}