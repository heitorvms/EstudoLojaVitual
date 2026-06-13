package com.dev.Backend.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.BaixaContaFinanceiraDTO;
import com.dev.Backend.dto.CobrancaHistoricoDTO;
import com.dev.Backend.dto.ContaFinanceiraDTO;
import com.dev.Backend.dto.FinanceiroResumoDTO;
import com.dev.Backend.dto.GerarContasFinanceirasDTO;
import com.dev.Backend.dto.RegistrarCobrancaWhatsappDTO;
import com.dev.Backend.dto.WhatsappCobrancaPreviewDTO;
import com.dev.Backend.entity.StatusContaFinanceira;
import com.dev.Backend.entity.TipoContaFinanceira;
import com.dev.Backend.service.CotacaoFinanceiroService;

@RestController
@RequestMapping("/api/financeiro")
@CrossOrigin(origins = "http://localhost:3000")
public class ContaFinanceiraController {

    private final CotacaoFinanceiroService cotacaoFinanceiroService;

    public ContaFinanceiraController(CotacaoFinanceiroService cotacaoFinanceiroService) {
        this.cotacaoFinanceiroService = cotacaoFinanceiroService;
    }

    @GetMapping(value = { "", "/" })
    public Page<ContaFinanceiraDTO> listar(
            @RequestParam(required = false) TipoContaFinanceira tipo,
            @RequestParam(required = false) StatusContaFinanceira status,
            Pageable pageable) {
        return cotacaoFinanceiroService.listar(tipo, status, pageable);
    }

    @GetMapping("/resumo")
    public FinanceiroResumoDTO resumo() {
        return cotacaoFinanceiroService.obterResumo();
    }

    @GetMapping("/cotacao/{idCotacao}")
    public List<ContaFinanceiraDTO> listarPorCotacao(@PathVariable Long idCotacao) {
        return cotacaoFinanceiroService.listarPorCotacao(idCotacao);
    }

    @PostMapping("/cotacao/{idCotacao}/gerar")
    public List<ContaFinanceiraDTO> gerar(
            @PathVariable Long idCotacao,
            @RequestParam(defaultValue = "false") boolean substituir,
            @RequestBody(required = false) GerarContasFinanceirasDTO opcoes) {
        return cotacaoFinanceiroService.gerarContasDaCotacao(idCotacao, substituir, opcoes);
    }

    @PostMapping("/atualizar-vencidas")
    public ResponseEntity<Integer> atualizarVencidas() {
        return ResponseEntity.ok(cotacaoFinanceiroService.atualizarContasVencidas());
    }

    @GetMapping("/cobranca/vencidas-preview")
    public List<WhatsappCobrancaPreviewDTO> previewsCobrancaVencidas() {
        return cotacaoFinanceiroService.listarPreviewsCobrancaVencidas();
    }

    @PostMapping("/cobranca/lote-vencidas")
    public List<CobrancaHistoricoDTO> registrarCobrancaLoteVencidas() {
        return cotacaoFinanceiroService.registrarCobrancaLoteVencidas();
    }

    @GetMapping("/contas/{id}")
    public ContaFinanceiraDTO buscar(@PathVariable Long id) {
        return cotacaoFinanceiroService.buscarPorId(id);
    }

    @GetMapping("/contas/{id}/whatsapp-cobranca")
    public WhatsappCobrancaPreviewDTO previewWhatsappCobranca(@PathVariable Long id) {
        return cotacaoFinanceiroService.previewCobrancaWhatsapp(id);
    }

    @GetMapping("/contas/{id}/historico-cobranca")
    public List<CobrancaHistoricoDTO> historicoCobranca(@PathVariable Long id) {
        return cotacaoFinanceiroService.listarHistoricoCobranca(id);
    }

    @PostMapping("/contas/{id}/registrar-cobranca")
    public CobrancaHistoricoDTO registrarCobranca(
            @PathVariable Long id,
            @RequestBody(required = false) RegistrarCobrancaWhatsappDTO body) {
        return cotacaoFinanceiroService.registrarCobrancaWhatsapp(id, body);
    }

    @PatchMapping("/contas/{id}/baixa")
    public ContaFinanceiraDTO baixa(@PathVariable Long id, @RequestBody BaixaContaFinanceiraDTO dto) {
        return cotacaoFinanceiroService.registrarBaixa(id, dto);
    }

    @PatchMapping("/contas/{id}/cancelar")
    public ContaFinanceiraDTO cancelar(@PathVariable Long id) {
        return cotacaoFinanceiroService.cancelar(id);
    }
}
