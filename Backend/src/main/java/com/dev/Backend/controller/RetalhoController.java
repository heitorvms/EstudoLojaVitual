package com.dev.Backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.RetalhoDTO;
import com.dev.Backend.service.RetalhoService;

@RestController
@RequestMapping("/api/retalhos")
@CrossOrigin(origins = "http://localhost:3000")
public class RetalhoController {

    private final RetalhoService service;

    public RetalhoController(RetalhoService service) {
        this.service = service;
    }

    @GetMapping
    public List<RetalhoDTO> listar() {
        return service.listar();
    }

    @PostMapping("/{id}/usar")
    public ResponseEntity<Void> usar(@PathVariable Long id, @RequestBody UsoRetalhoRequest request) {
        service.usar(id, request.quantidade());
        return ResponseEntity.noContent().build();
    }

    public record UsoRetalhoRequest(Integer quantidade) {}
}
