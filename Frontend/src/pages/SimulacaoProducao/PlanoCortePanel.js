import React from "react";
import { Column } from "primereact/column";
import {
  DataTableStyled,
  ResumoGrid,
  ResumoCard,
  InfoBadge,
  BadgeList,
  HintText,
  PlanoMaterialBlock,
} from "./styled";
import { cm, descreverCortes, descreverRetalho } from "../../utils/planoCorte";

function PlanoMaterial({ material }) {
  const plano = material.planoCorte;
  return (
    <PlanoMaterialBlock>
      <DataTableStyled
        value={plano.padroes}
        header={material.nome}
        responsiveLayout="scroll"
        selectionMode={null}
      >
        <Column header="Barras" style={{ width: 110 }} body={(p) => <InfoBadge>{p.quantidadeBarras}×</InfoBadge>} />
        <Column header="Cortes em cada barra" body={(p) => descreverCortes(p.cortes)} />
        <Column header="Sobra" style={{ width: 130 }} body={(p) => cm(p.sobraMm)} />
      </DataTableStyled>

      <BadgeList>
        <strong>Retalhos:</strong>
        {plano.retalhos.length === 0 && <span>nenhum</span>}
        {plano.retalhos.map((r) => (
          <InfoBadge key={r.comprimentoMm}>{descreverRetalho(r)}</InfoBadge>
        ))}
      </BadgeList>

      <ResumoGrid>
        <ResumoCard>
          <div className="label">Barras de {plano.comprimentoBarraMm / 1000} m</div>
          <div className="value">{plano.totalBarras}</div>
        </ResumoCard>
        <ResumoCard>
          <div className="label">Peças</div>
          <div className="value">{plano.totalPecas}</div>
        </ResumoCard>
        <ResumoCard>
          <div className="label">Aproveitamento</div>
          <div className="value">{Number(plano.aproveitamentoPercentual).toLocaleString("pt-BR")}%</div>
        </ResumoCard>
        <ResumoCard>
          <div className="label">Sucata (abaixo de {cm(plano.retalhoMinimoMm)})</div>
          <div className="value">{cm(plano.sucataMm)}</div>
        </ResumoCard>
      </ResumoGrid>
    </PlanoMaterialBlock>
  );
}

export default function PlanoCortePanel({ materiais }) {
  const comPlano = (materiais || []).filter((m) => m.planoCorte);
  if (comPlano.length === 0) return null;
  return (
    <>
      {comPlano.map((m) => (
        <PlanoMaterial key={m.materialId} material={m} />
      ))}
      <HintText>
        Materiais com peças usam o plano de corte (espessura do disco:{" "}
        <strong>{comPlano[0].planoCorte.espessuraCorteMm} mm</strong>) no lugar do percentual de perda.
      </HintText>
    </>
  );
}
