package com.dev.Backend.controller;

import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.service.MaterialDisponivelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/materiais-disponiveis")
@CrossOrigin(origins = "http://localhost:3000/")
public class MaterialDisponivelController {

    @Autowired
    private MaterialDisponivelService service;

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