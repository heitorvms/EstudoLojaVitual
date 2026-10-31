import React from "react";
import { Link } from "react-router-dom";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { DataTableStyled } from "../../styles/oficinaLayout";
import { moeda } from "../../utils/moeda";
import { formatarDataIso } from "../../utils/datas";
import { cm } from "../../utils/planoCorte";

const tipoMovimentacao = (r) => {
  if (r.tipo === "SAIDA_OS") return { label: "Saída para OS", severity: "warning" };
  if (r.tipo === "AJUSTE") {
    return r.barras < 0
      ? { label: "Estorno de compra", severity: "danger" }
      : { label: "Devolução de OS", severity: "info" };
  }
  return { label: r.tipo, severity: null };
};

const barrasComSinal = (barras) => {
  const valor = Number(barras || 0);
  return (
    <span style={{ color: valor < 0 ? "#c62828" : "#2e7d32", fontWeight: 600 }}>
      {valor > 0 ? `+${valor}` : `${valor}`}
    </span>
  );
};

export const formatarData = (valor) => {
  if (!valor) return "-";
  if (typeof valor === "string" && valor.length === 10) return formatarDataIso(valor);
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "-" : data.toLocaleDateString("pt-BR");
};

export const metrosDaBarra = (comprimentoMm) => `${(Number(comprimentoMm || 6000) / 1000).toFixed(2)} m`;

const linkOs = (id, nome) => (id ? <Link to={`/ordens-servico/${id}`}>{`OS #${id}${nome ? ` — ${nome}` : ""}`}</Link> : "-");

const Secao = ({ titulo, children }) => (
  <div style={{ marginBottom: 16 }}>
    <h4 style={{ margin: "0 0 8px", color: "#1a1a2e" }}>{titulo}</h4>
    {children}
  </div>
);

export default function HistoricoMaterial({ historico }) {
  if (!historico) return <p style={{ color: "#666", margin: 0 }}>Carregando histórico...</p>;

  return (
    <div style={{ padding: "8px 4px" }}>
      <Secao titulo="Compras (valor pago por barra)">
        <DataTableStyled value={historico.compras} size="small" emptyMessage="Nenhuma compra ativa deste material">
          <Column header="Data" body={(r) => formatarData(r.dataCompra)} />
          <Column header="Compra" body={(r) => <Link to={`/compras-lote/${r.compraId}/editar`}>{`#${r.compraId}`}</Link>} />
          <Column header="Distribuidora" body={(r) => r.distribuidora || "-"} />
          <Column header="Nota" body={(r) => r.numeroNota || "-"} />
          <Column field="barras" header="Barras" />
          <Column header="Barra" body={(r) => metrosDaBarra(r.comprimentoBarraMm)} />
          <Column header="R$/barra pago" body={(r) => moeda(r.valorBarra)} />
          <Column header="Total" body={(r) => moeda(r.valorTotal)} />
        </DataTableStyled>
      </Secao>

      <Secao titulo="Uso em ordens de serviço">
        <DataTableStyled value={historico.movimentacoes} size="small" emptyMessage="Material ainda não usado em OS">
          <Column header="Data" body={(r) => formatarData(r.data)} />
          <Column
            header="Tipo"
            body={(r) => {
              const tipo = tipoMovimentacao(r);
              return <Tag value={tipo.label} severity={tipo.severity} />;
            }}
          />
          <Column header="Barras" body={(r) => barrasComSinal(r.barras)} />
          <Column header="OS" body={(r) => linkOs(r.ordemServicoId, r.ordemServicoNome)} />
          <Column
            header="Cotação"
            body={(r) =>
              r.cotacaoId ? <Link to={`/cotacoes/${r.cotacaoId}`}>{`#${r.cotacaoId}${r.cotacaoNome ? ` — ${r.cotacaoNome}` : ""}`}</Link> : "-"
            }
          />
          <Column header="Referência" body={(r) => r.referencia || "-"} />
        </DataTableStyled>
      </Secao>

      <Secao titulo="Retalhos gerados">
        <DataTableStyled value={historico.retalhos} size="small" emptyMessage="Nenhum retalho deste material">
          <Column header="Comprimento" body={(r) => cm(r.comprimentoMm)} />
          <Column field="quantidade" header="Quantidade" />
          <Column header="Origem" body={(r) => linkOs(r.ordemServicoId, r.ordemServicoNome)} />
          <Column header="Gerado em" body={(r) => formatarData(r.dataCriacao)} />
        </DataTableStyled>
      </Secao>
    </div>
  );
}
