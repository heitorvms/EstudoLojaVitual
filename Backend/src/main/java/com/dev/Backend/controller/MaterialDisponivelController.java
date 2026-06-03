package com.dev.Backend.controller;

import com.dev.Backend.dto.ImportSpreadsheetResponseDTO;
import com.dev.Backend.dto.ImportarPrecosBatchDTO;
import com.dev.Backend.dto.MaterialImportadoDTO;
import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.entity.OrigemPreco;
import com.dev.Backend.repository.DistribuidoraRepository;
import com.dev.Backend.service.MaterialApelidoService;
import com.dev.Backend.service.MaterialDisponivelService;
import com.dev.Backend.service.MaterialPrecoService;
import com.dev.Backend.service.MaterialSpreadsheetParser;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materiais-disponiveis")
@CrossOrigin(origins = "http://localhost:3000/")
public class MaterialDisponivelController {

    @Autowired
    private MaterialDisponivelService service;

    @Autowired
    private MaterialSpreadsheetParser parser;

    @Autowired
    private MaterialPrecoService precoService;

    @Autowired
    private MaterialApelidoService apelidoService;

    @Autowired
    private DistribuidoraRepository distribuidoraRepository;

    @GetMapping("/opcoes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaterialDisponivel>> opcoes(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(service.findOpcoes(query));
    }

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
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody MaterialDisponivel material) {
        try {
            return ResponseEntity.ok(service.update(id, material));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/importar-planilha", consumes = "multipart/form-data")
    public ResponseEntity<?> importarPlanilha(@RequestParam("arquivo") MultipartFile arquivo,
                                                @RequestParam(value = "distribuidoraId", required = false) Long distribuidoraId) {
        if (arquivo == null || arquivo.isEmpty()) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", "Arquivo é obrigatório."));
        }
        try {
            ImportSpreadsheetResponseDTO resp = parser.parse(
                arquivo.getOriginalFilename(), arquivo.getInputStream(), distribuidoraId);
            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", "Não foi possível ler a planilha: " + e.getMessage()));
        }
    }

    @PostMapping("/importar-batch")
    public ResponseEntity<?> importarBatch(@RequestBody ImportarPrecosBatchDTO payload) {
        if (payload == null || payload.getDistribuidoraId() == null) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", "Distribuidora é obrigatória."));
        }
        if (payload.getItens() == null || payload.getItens().isEmpty()) {
            return ResponseEntity.unprocessableEntity()
                .body(Map.of("message", "Envie pelo menos um item."));
        }

        Distribuidora distribuidora = distribuidoraRepository.findById(payload.getDistribuidoraId())
            .orElse(null);
        if (distribuidora == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Distribuidora não encontrada."));
        }

        int materiaisCriados = 0;
        int precosRegistrados = 0;
        int apelidosCriados = 0;
        int ignorados = 0;

        for (MaterialImportadoDTO item : payload.getItens()) {
            if (item.getDescricao() == null || item.getDescricao().isBlank()
                || item.getTamanho() == null || item.getTamanho().signum() <= 0
                || item.getPrecoUnitario() == null || item.getPrecoUnitario().signum() < 0) {
                ignorados++;
                continue;
            }

            MaterialDisponivel material;
            if (item.getMaterialMatchId() != null) {
                material = service.findById(item.getMaterialMatchId()).orElse(null);
                if (material == null) { ignorados++; continue; }
            } else {
                String descricaoFinal = item.getDimensao() != null && !item.getDimensao().isBlank()
                    ? item.getDescricao().trim() + " " + item.getDimensao().trim()
                    : item.getDescricao().trim();
                MaterialDisponivel novo = new MaterialDisponivel();
                novo.setDescricao(descricaoFinal);
                novo.setTamanho(item.getTamanho());
                material = service.save(novo);
                materiaisCriados++;
            }

            precoService.registrarPreco(
                material, distribuidora,
                item.getPrecoUnitario(),
                null, null,
                OrigemPreco.IMPORTACAO
            );
            precosRegistrados++;

            if (item.isGravarApelido()) {
                apelidoService.salvarSeNaoExiste(material, distribuidora,
                    item.getDescricao(), item.getDimensao());
                apelidosCriados++;
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "materiaisCriados", materiaisCriados,
            "precosRegistrados", precosRegistrados,
            "apelidosCriados", apelidosCriados,
            "ignorados", ignorados,
            "distribuidora", distribuidora.getNome()
        ));
    }

    @GetMapping("/template-planilha")
    public ResponseEntity<byte[]> baixarTemplate() {
        try {
            byte[] bytes = parser.gerarTemplateXlsx();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "template-materiais.xlsx");
            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "message",
                "Material em uso em simulações/cotações salvas e não pode ser excluído."
            ));
        }
    }
}
