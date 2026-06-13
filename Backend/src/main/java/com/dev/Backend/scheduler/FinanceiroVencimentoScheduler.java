package com.dev.Backend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.dev.Backend.service.FinanceiroVencimentoService;

@Component
public class FinanceiroVencimentoScheduler {

    private final FinanceiroVencimentoService financeiroVencimentoService;

    public FinanceiroVencimentoScheduler(FinanceiroVencimentoService financeiroVencimentoService) {
        this.financeiroVencimentoService = financeiroVencimentoService;
    }

    @Scheduled(cron = "0 0 6 * * *")
    public void marcarVencidasDiariamente() {
        financeiroVencimentoService.atualizarContasVencidas();
    }
}
