package com.dev.Backend.controller;

import com.dev.Backend.entity.CompraLote;
import com.dev.Backend.entity.EstoqueMaterial;
import com.dev.Backend.service.CompraLoteService;
import com.dev.Backend.service.EstoqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000/")
public class CompraEstoqueController {

    @Autowired private CompraLoteService compraLoteService;
    @Autowired private EstoqueService estoqueService;

    @GetMapping("/compras-lote")
    public Page<CompraLote> listarCompras(
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return compraLoteService.listar(query, pageable);
    }

    @GetMapping("/compras-lote/{id}")
    public CompraLote buscarCompra(@PathVariable Long id) {
        return compraLoteService.buscar(id);
    }

    @PostMapping("/compras-lote")
    public CompraLote criarCompra(@RequestBody CompraLote compra) {
        return compraLoteService.criar(compra);
    }

    @PutMapping("/compras-lote/{id}")
    public CompraLote atualizarCompra(@PathVariable Long id, @RequestBody CompraLote compra) {
        return compraLoteService.atualizar(id, compra);
    }

    @PostMapping("/compras-lote/{id}/cancelar")
    public CompraLote cancelarCompra(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return compraLoteService.cancelar(id, body.get("motivo"));
    }

    @GetMapping("/estoque")
    public List<EstoqueMaterial> listarEstoque() {
        return estoqueService.listar();
    }
}
