package com.dev.Backend.controller;

import com.dev.Backend.dto.CotacaoServicoDTO;
import com.dev.Backend.dto.CotacaoServicoInputDTO;
import com.dev.Backend.dto.DistribuidoraCotacaoDTO;
import com.dev.Backend.entity.CotacaoServico;
import com.dev.Backend.service.CotacaoServicoService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cotacoes")
@CrossOrigin("http://localhost:3000/")
public class CotacaoServicoController {

    @Autowired
    private CotacaoServicoService cotacaoServicoService;
    
    @GetMapping("/{id}/calcula-valores")
    public ResponseEntity<List<DistribuidoraCotacaoDTO>> calcularValoresPorDistribuidora(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "0") Double percentualLucro) {
        return ResponseEntity.ok(cotacaoServicoService.calcularValoresPorDistribuidora(id, percentualLucro));
    }
    
    @GetMapping("/{id}/distribuidora-mais-barata")
    public ResponseEntity<DistribuidoraCotacaoDTO> buscarDistribuidoraMaisBarata(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "0") Double percentualLucro) {
        return ResponseEntity.ok(cotacaoServicoService.buscarDistribuidoraMaisBarata(id, percentualLucro));
    }

    @GetMapping("/")
    public Page<CotacaoServicoDTO> buscarTodos(Pageable pageable) {
        return cotacaoServicoService.buscarTodos(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CotacaoServicoDTO> getById(@PathVariable Long id) {
        return cotacaoServicoService.findById(id)
                .map(cotacaoServicoService::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public Page<CotacaoServicoDTO> search(@RequestParam String query, Pageable pageable) {
        return cotacaoServicoService.search(query, pageable);
    }

    @PostMapping("/")
    public ResponseEntity<CotacaoServicoDTO> criarCotacao(@RequestBody CotacaoServicoInputDTO inputDTO) {
        CotacaoServico novaCotacao = cotacaoServicoService.criarCotacao(inputDTO);
        CotacaoServicoDTO dto = cotacaoServicoService.toDTO(novaCotacao);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCotacao(@PathVariable Long id) {
        cotacaoServicoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}