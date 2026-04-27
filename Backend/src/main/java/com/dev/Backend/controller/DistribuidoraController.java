package com.dev.Backend.controller;

import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.service.DistribuidoraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/distribuidoras")
@CrossOrigin(origins = "http://localhost:3000/")
public class DistribuidoraController {

    @Autowired
    private DistribuidoraService service;

    @GetMapping("/sugestoes")
    public ResponseEntity<Page<Distribuidora>> getSugestoes(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Distribuidora> sugestoes = service.findSugestoesByNome(query, pageable);
        return ResponseEntity.ok(sugestoes);
    }

    @GetMapping
    public ResponseEntity<Page<Distribuidora>> getAll(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Distribuidora> distribuidoras = service.findAll(query, pageable);
        return ResponseEntity.ok(distribuidoras);
    }

    @PostMapping
    public ResponseEntity<Distribuidora> create(@RequestBody Distribuidora distribuidora) {
        try {
            return ResponseEntity.ok(service.save(distribuidora));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Distribuidora> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Distribuidora> update(@PathVariable Long id, @RequestBody Distribuidora distribuidora) {
        return ResponseEntity.ok(service.update(id, distribuidora));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}