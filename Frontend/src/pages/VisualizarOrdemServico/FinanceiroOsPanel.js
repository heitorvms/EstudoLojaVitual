import React from "react";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { PanelCard, PanelTitle, DataTableStyled, FormGrid } from "../../styles/oficinaLayout";
import { CATEGORIA_LABEL, FORMAS, STATUS_LABEL, statusSeverity } from "../Financeiro/constantes";
import { formatarDataIso } from "../../utils/datas";

export const exibeContas = (os) => os.possuiFinanceiro || os.status === "CANCELADO";

const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const opcoesFinanceiroPadrao = () => ({
  material: { parcelas: 1, diasPrimeiraParcela: 0, formaPagamento: "A_VISTA" },
  maoDeObra: { parcelas: 1, diasPrimeiraParcela: 30, formaPagamento: "A_VISTA" },
  intervaloDiasParcelas: 30,
  diasVencimentoPagar: 15,
  formaPagamentoPagar: "A_VISTA",
});

function RecebimentoCampos({ titulo, valor, recebimento, onChange }) {
  const alterar = (campo, v) => onChange({ ...recebimento, [campo]: v });
  return (
    <>
      <h4 style={{ margin: "12px 0 4px" }}>
        {titulo} — {moeda(valor)}
      </h4>
      <FormGrid>
        <div>
          <label>Forma de pagamento</label>
          <Dropdown value={recebimento.formaPagamento} options={FORMAS} onChange={(e) => alterar("formaPagamento", e.value)} />
        </div>
        <div>
          <label>Parcelas</label>
          <InputNumber value={recebimento.parcelas} onValueChange={(e) => alterar("parcelas", e.value || 1)} min={1} max={24} />
        </div>
        <div>
          <label>1ª parcela vence em (dias)</label>
          <InputNumber
            value={recebimento.diasPrimeiraParcela}
            onValueChange={(e) => alterar("diasPrimeiraParcela", e.value ?? 0)}
            min={0}
          />
        </div>
      </FormGrid>
    </>
  );
}

export default function FinanceiroOsPanel({ os, contas, opcoes, onChange, acao }) {
  if (exibeContas(os)) {
    return (
      <PanelCard>
        <PanelTitle>Financeiro</PanelTitle>
        <DataTableStyled value={contas} emptyMessage="Sem contas">
          <Column header="Categoria" body={(r) => CATEGORIA_LABEL[r.categoria] || "-"} />
          <Column header="Tipo" body={(r) => (r.tipo === "RECEBER" ? "A receber" : "A pagar")} />
          <Column header="Parcela" body={(r) => (r.totalParcelas > 1 ? `${r.numeroParcela}/${r.totalParcelas}` : "-")} />
          <Column
            header="Status"
            body={(r) => <Tag value={STATUS_LABEL[r.status] || r.status} severity={statusSeverity(r.status)} />}
          />
          <Column header="Valor" body={(r) => moeda(r.valor)} />
          <Column header="Vencimento" body={(r) => formatarDataIso(r.dataVencimento)} />
        </DataTableStyled>
      </PanelCard>
    );
  }

  const alterar = (campo, v) => onChange({ ...opcoes, [campo]: v });
  return (
    <PanelCard>
      <PanelTitle>Financeiro</PanelTitle>
      <p style={{ margin: 0, color: "#64748b" }}>
        Defina como o cliente vai pagar. As contas serão geradas no financeiro ao salvar a OS.
      </p>
      <RecebimentoCampos
        titulo="Material"
        valor={os.valorMaterialCliente}
        recebimento={opcoes.material}
        onChange={(v) => alterar("material", v)}
      />
      <RecebimentoCampos
        titulo="Mão de obra"
        valor={os.valorMaoDeObraCliente}
        recebimento={opcoes.maoDeObra}
        onChange={(v) => alterar("maoDeObra", v)}
      />
      <h4 style={{ margin: "12px 0 4px" }}>Parcelas e custos</h4>
      <FormGrid>
        <div>
          <label>Intervalo entre parcelas (dias)</label>
          <InputNumber
            value={opcoes.intervaloDiasParcelas}
            onValueChange={(e) => alterar("intervaloDiasParcelas", e.value || 30)}
            min={1}
          />
        </div>
        <div>
          <label>Custos (a pagar) vencem em (dias)</label>
          <InputNumber
            value={opcoes.diasVencimentoPagar}
            onValueChange={(e) => alterar("diasVencimentoPagar", e.value ?? 15)}
            min={0}
          />
        </div>
        <div>
          <label>Forma de pagamento dos custos</label>
          <Dropdown value={opcoes.formaPagamentoPagar} options={FORMAS} onChange={(e) => alterar("formaPagamentoPagar", e.value)} />
        </div>
      </FormGrid>
      {acao}
    </PanelCard>
  );
}
