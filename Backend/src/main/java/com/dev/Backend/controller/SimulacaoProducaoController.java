package com.dev.Backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.SimulacaoHistoricoDTO;
import com.dev.Backend.dto.SimulacaoRequestDTO;
import com.dev.Backend.dto.SimulacaoResponseDTO;
import com.dev.Backend.service.SimulacaoProducaoService;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/simulacao-producao")
public class SimulacaoProducaoController {

    @Autowired
    private SimulacaoProducaoService service;

    @PostMapping("/calcular")
    public ResponseEntity<?> calcular(@RequestBody SimulacaoRequestDTO request) {
        try {
            SimulacaoResponseDTO response = service.calcular(request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/historico")
    public ResponseEntity<?> salvar(@RequestBody SimulacaoRequestDTO request) {
        try {
            SimulacaoResponseDTO response = service.salvar(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/historico/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id,
                                       @RequestBody SimulacaoRequestDTO request) {
        try {
            SimulacaoResponseDTO response = service.atualizar(id, request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/historico")
    public ResponseEntity<List<SimulacaoHistoricoDTO>> listarHistorico() {
        return ResponseEntity.ok(service.listarHistorico());
    }

    @GetMapping("/historico/{id}")
    public ResponseEntity<?> obterHistorico(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.obterHistorico(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/historico/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            service.excluirHistorico(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
    }
}
