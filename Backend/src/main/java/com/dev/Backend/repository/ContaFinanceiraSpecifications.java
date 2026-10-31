package com.dev.Backend.repository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dev.Backend.dto.FiltroContaFinanceiraDTO;
import com.dev.Backend.entity.ContaFinanceira;
import com.dev.Backend.entity.CotacaoServico;
import com.dev.Backend.entity.Distribuidora;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public final class ContaFinanceiraSpecifications {

    private static final char ESCAPE = '\\';

    private ContaFinanceiraSpecifications() {
    }

    /** {@code cotacaoDaOs} é o orçamento da OS filtrada, resolvido antes porque a conta não referencia a OS. */
    public static Specification<ContaFinanceira> comFiltro(FiltroContaFinanceiraDTO filtro, Long cotacaoDaOs) {
        return (root, query, cb) -> {
            List<Predicate> condicoes = new ArrayList<>();
            igual(condicoes, cb, root.get("tipo"), filtro.tipo());
            igual(condicoes, cb, root.get("status"), filtro.status());
            igual(condicoes, cb, root.get("categoria"), filtro.categoria());
            igual(condicoes, cb, root.get("cotacaoServico").get("id"), filtro.cotacaoId());
            igual(condicoes, cb, root.get("cotacaoServico").get("id"), cotacaoDaOs);
            igual(condicoes, cb, root.get("compraLote").get("id"), filtro.compraLoteId());
            if (filtro.vencimentoDe() != null) {
                condicoes.add(cb.greaterThanOrEqualTo(root.get("dataVencimento"), inicioDoDia(filtro.vencimentoDe())));
            }
            if (filtro.vencimentoAte() != null) {
                condicoes.add(cb.lessThan(root.get("dataVencimento"), inicioDoDia(filtro.vencimentoAte().plusDays(1))));
            }
            String busca = filtro.busca() == null ? "" : filtro.busca().trim();
            if (!busca.isEmpty()) {
                condicoes.add(buscaTextual(root, cb, busca));
            }
            return cb.and(condicoes.toArray(Predicate[]::new));
        };
    }

    private static void igual(List<Predicate> condicoes, CriteriaBuilder cb, Expression<?> campo, Object valor) {
        if (valor != null) {
            condicoes.add(cb.equal(campo, valor));
        }
    }

    private static Predicate buscaTextual(Root<ContaFinanceira> root, CriteriaBuilder cb, String busca) {
        Join<ContaFinanceira, CotacaoServico> cotacao = root.join("cotacaoServico", JoinType.LEFT);
        Join<ContaFinanceira, Distribuidora> distribuidora = root.join("distribuidora", JoinType.LEFT);
        String termo = "%" + escaparLike(busca.toLowerCase()) + "%";
        return cb.or(
                cb.like(cb.lower(root.get("descricao")), termo, ESCAPE),
                cb.like(cb.lower(root.get("clienteNomeSnapshot")), termo, ESCAPE),
                cb.like(cb.lower(cotacao.get("nome")), termo, ESCAPE),
                cb.like(cb.lower(distribuidora.get("nome")), termo, ESCAPE));
    }

    private static String escaparLike(String texto) {
        return texto.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private static Date inicioDoDia(LocalDate data) {
        return Date.from(data.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}
