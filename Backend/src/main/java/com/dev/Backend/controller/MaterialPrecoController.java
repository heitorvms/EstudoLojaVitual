package com.dev.Backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dev.Backend.dto.MaterialPrecoDTO;
import com.dev.Backend.dto.RegistrarPrecoDTO;
import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.entity.MaterialPreco;
import com.dev.Backend.repository.DistribuidoraRepository;
import com.dev.Backend.repository.MaterialDisponivelRepository;
import com.dev.Backend.service.MaterialPrecoService;

@RestController
@RequestMapping("/api/material-precos")
@CrossOrigin(origins = "http://localhost:3000/")
public class MaterialPrecoController {

    @Autowired
    private MaterialPrecoService service;

    @Autowired
    private MaterialDisponivelRepository materialRepo;

    @Autowired
    private DistribuidoraRepository distribuidoraRepo;

    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody RegistrarPrecoDTO dto) {
        if (dto.getMaterialDisponivelId() == null || dto.getDistribuidoraId() == null) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", "materialDisponivelId e distribuidoraId são obrigatórios."));
        }
        if (dto.getPrecoUnitario() == null || dto.getPrecoUnitario().signum() < 0) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", "Preço inválido."));
        }

        MaterialDisponivel material = materialRepo.findById(dto.getMaterialDisponivelId())
            .orElse(null);
        if (material == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Material não encontrado."));
        }

        Distribuidora distribuidora = distribuidoraRepo.findById(dto.getDistribuidoraId())
            .orElse(null);
        if (distribuidora == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Distribuidora não encontrada."));
        }

        MaterialPreco mp = service.registrarPreco(
            material, distribuidora,
            dto.getPrecoUnitario(),
            dto.getPrazoEntregaDias(),
            dto.getObservacao(),
            dto.getOrigem()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(MaterialPrecoDTO.fromEntity(mp));
    }

    @GetMapping("/material/{materialId}/vigentes")
    public ResponseEntity<List<MaterialPrecoDTO>> vigentesPorMaterial(@PathVariable Long materialId) {
        List<MaterialPrecoDTO> lista = service.listarVigentesPorMaterial(materialId)
            .stream().map(MaterialPrecoDTO::fromEntity).toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/distribuidora/{distribuidoraId}/vigentes")
    public ResponseEntity<List<MaterialPrecoDTO>> vigentesPorDistribuidora(@PathVariable Long distribuidoraId) {
        List<MaterialPrecoDTO> lista = service.listarVigentesPorDistribuidora(distribuidoraId)
            .stream().map(MaterialPrecoDTO::fromEntity).toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/vigente")
    public ResponseEntity<?> buscarVigente(@RequestParam Long materialId,
                                            @RequestParam Long distribuidoraId) {
        return service.buscarVigente(materialId, distribuidoraId)
            .map(mp -> ResponseEntity.ok((Object) MaterialPrecoDTO.fromEntity(mp)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/historico")
    public ResponseEntity<List<MaterialPrecoDTO>> historico(@RequestParam Long materialId,
                                                              @RequestParam Long distribuidoraId) {
        List<MaterialPrecoDTO> lista = service.listarHistorico(materialId, distribuidoraId)
            .stream().map(MaterialPrecoDTO::fromEntity).toList();
        return ResponseEntity.ok(lista);
    }
}
