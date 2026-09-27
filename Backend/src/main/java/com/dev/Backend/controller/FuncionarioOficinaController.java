package com.dev.Backend.controller;

import com.dev.Backend.dto.FuncionarioResumoDTO;
import com.dev.Backend.entity.FuncionarioOficina;
import com.dev.Backend.service.FuncionarioOficinaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/funcionarios-oficina")
@CrossOrigin(origins = "http://localhost:3000/")
public class FuncionarioOficinaController {

    @Autowired
    private FuncionarioOficinaService service;

    @GetMapping
    public List<FuncionarioOficina> listar(@RequestParam(required = false) Boolean apenasAtivos) {
        if (Boolean.TRUE.equals(apenasAtivos)) return service.listarAtivos();
        return service.listarTodos();
    }

    @GetMapping("/{id}/resumo")
    public FuncionarioResumoDTO resumo(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.resumo(id, inicio, fim);
    }

    @PatchMapping("/{id}/lancamentos/pagamento")
    public ResponseEntity<Void> registrarPagamento(@PathVariable Long id, @RequestBody PagamentoLancamentosDTO body) {
        service.registrarPagamento(id, body.ids(), body.pago());
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public FuncionarioOficina criar(@RequestBody FuncionarioOficina f) {
        return service.salvar(f);
    }

    @PutMapping("/{id}")
    public FuncionarioOficina atualizar(@PathVariable Long id, @RequestBody FuncionarioOficina f) {
        return service.atualizar(id, f);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> excluir(@PathVariable Long id) {
        boolean excluido = service.excluir(id);
        return Map.of(
                "desativado", !excluido,
                "message", excluido
                        ? "Funcionário excluído"
                        : "Funcionário possui horas lançadas e foi desativado para preservar o histórico");
    }

    public record PagamentoLancamentosDTO(List<Long> ids, boolean pago) {}
}
