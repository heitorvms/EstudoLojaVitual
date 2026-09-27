package com.dev.Backend.controller;

import com.dev.Backend.dto.GerarContasFinanceirasDTO;
import com.dev.Backend.dto.OrdemServicoDTO;
import com.dev.Backend.dto.OrdemServicoInputDTO;
import com.dev.Backend.entity.CategoriaContaFinanceira;
import com.dev.Backend.service.OrdemServicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordens-servico")
@CrossOrigin(origins = "http://localhost:3000/")
public class OrdemServicoController {

    @Autowired
    private OrdemServicoService service;

    @GetMapping
    public Page<OrdemServicoDTO> listar(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.listar(query, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemServicoDTO> buscar(@PathVariable Long id) {
        return service.buscar(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rascunho-cotacao/{cotacaoId}")
    public OrdemServicoDTO rascunhoDeCotacao(@PathVariable Long cotacaoId) {
        return service.rascunhoDeCotacao(cotacaoId);
    }

    @PostMapping("/de-cotacao/{cotacaoId}")
    public OrdemServicoDTO criarDeCotacao(@PathVariable Long cotacaoId, @RequestBody OrdemServicoInputDTO input) {
        return service.criarDeCotacao(cotacaoId, input);
    }

    @PutMapping("/{id}")
    public OrdemServicoDTO atualizar(@PathVariable Long id, @RequestBody OrdemServicoInputDTO input) {
        return service.atualizar(id, input);
    }

    @PostMapping("/{id}/mao-de-obra")
    public OrdemServicoDTO adicionarMaoDeObra(@PathVariable Long id,
                                              @RequestBody OrdemServicoInputDTO.MaoDeObraInputDTO lancamento) {
        return service.adicionarMaoDeObra(id, lancamento);
    }

    @PatchMapping("/{id}/pagamento")
    public OrdemServicoDTO alterarPagamento(@PathVariable Long id,
                                            @RequestParam CategoriaContaFinanceira categoria,
                                            @RequestParam boolean pago) {
        return service.alterarPagamento(id, categoria, pago);
    }

    @PostMapping("/{id}/financeiro")
    public OrdemServicoDTO gerarFinanceiro(@PathVariable Long id, @RequestBody GerarContasFinanceirasDTO opcoes) {
        return service.gerarFinanceiro(id, opcoes);
    }
}
