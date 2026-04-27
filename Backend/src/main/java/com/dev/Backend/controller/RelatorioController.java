package com.dev.Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.dev.Backend.service.RelatorioService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "http://localhost:3000")
public class RelatorioController {

    private final RelatorioService relatorioService;

    @Autowired
    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/{nomeRelatorio}")
    public void gerarRelatorio(
            @PathVariable("nomeRelatorio") String nomeRelatorio,
            @RequestParam Map<String, Object> parametros,
            HttpServletResponse response) {
        try {
            String nomeArquivo = nomeRelatorio.toLowerCase() + ".pdf";

            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + nomeArquivo + "\"");

            relatorioService.gerarRelatorio(nomeRelatorio, parametros, response.getOutputStream());

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}