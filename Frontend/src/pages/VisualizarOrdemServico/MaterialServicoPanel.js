import React from "react";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { PanelCard, PanelTitle, DataTableStyled, TagList } from "../../styles/oficinaLayout";
import { descreverCortes, descreverRetalho } from "../../utils/planoCorte";

const comprimentoBarra = (r) => r.planoCorte?.comprimentoBarraMm ?? r.comprimentoBarraMm;

const necessario = (r) => {
  const mm = comprimentoBarra(r);
  const barra = mm ? ` de ${(mm / 1000).toLocaleString("pt-BR")} m` : "";
  return `${r.quantidade ?? 0} barra(s)${barra}`;
};

const planoCorte = (r) =>
  r.planoCorte
    ? r.planoCorte.padroes.map((p) => (
        <div key={descreverCortes(p.cortes)}>{`${p.quantidadeBarras} barra(s): ${descreverCortes(p.cortes)}`}</div>
      ))
    : "Sem peças definidas";

const retalhos = (r) => {
  if (!r.planoCorte) return "-";
  if (r.planoCorte.retalhos.length === 0) return "Nenhum";
  return (
    <TagList>
      {r.planoCorte.retalhos.map((ret) => (
        <Tag key={ret.comprimentoMm} value={descreverRetalho(ret)} severity="info" />
      ))}
    </TagList>
  );
};

export default function MaterialServicoPanel({ materiais, estoqueBaixado }) {
  return (
    <PanelCard>
      <PanelTitle>Material do serviço</PanelTitle>
      <DataTableStyled value={materiais || []} emptyMessage="Orçamento sem materiais">
        <Column field="descricao" header="Material" />
        <Column header="Necessário" body={necessario} />
        <Column header="Cortes por barra" body={planoCorte} />
        <Column
          header={estoqueBaixado ? "Retalhos gerados" : "Retalhos previstos"}
          style={{ width: 170 }}
          body={retalhos}
        />
      </DataTableStyled>
    </PanelCard>
  );
}
