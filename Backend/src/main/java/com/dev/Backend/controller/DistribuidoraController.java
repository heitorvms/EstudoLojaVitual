package com.dev.Backend.controller;

import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.service.DistribuidoraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/distribuidoras")
@CrossOrigin(origins = "http://localhost:3000/")
public class DistribuidoraController {

    @Autowired
    private DistribuidoraService service;

    @GetMapping
    public ResponseEntity<List<Distribuidora>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<Distribuidora> create(@RequestBody Distribuidora distribuidora) {
        return ResponseEntity.ok(service.save(distribuidora));
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