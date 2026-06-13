package com.dev.Backend.service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.entity.ContaFinanceira;
import com.dev.Backend.entity.StatusContaFinanceira;
import com.dev.Backend.repository.ContaFinanceiraRepository;

@Service
public class FinanceiroVencimentoService {

    private final ContaFinanceiraRepository contaFinanceiraRepository;

    public FinanceiroVencimentoService(ContaFinanceiraRepository contaFinanceiraRepository) {
        this.contaFinanceiraRepository = contaFinanceiraRepository;
    }

    @Transactional
    public int atualizarContasVencidas() {
        Date inicioHoje = inicioDoDia(new Date());
        List<ContaFinanceira> vencidas = contaFinanceiraRepository.findByStatusInAndDataVencimentoBefore(
                List.of(StatusContaFinanceira.PENDENTE, StatusContaFinanceira.PARCIAL),
                inicioHoje);
        for (ContaFinanceira conta : vencidas) {
            conta.setStatus(StatusContaFinanceira.VENCIDA);
        }
        if (!vencidas.isEmpty()) {
            contaFinanceiraRepository.saveAll(vencidas);
        }
        return vencidas.size();
    }

    private Date inicioDoDia(Date data) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(data);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }
}
