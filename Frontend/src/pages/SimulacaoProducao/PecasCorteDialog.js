import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import {
  DataTableStyled,
  InputTextStyled,
  RemoveItemButton,
  ActionCell,
  ButtonStyled,
  ButtonContainer,
  HintText,
} from "./styled";
import { cm } from "../../utils/planoCorte";

const novaPeca = () => ({
  uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  descricao: "",
  comprimentoMm: null,
  quantidade: 1,
});

const pecaValida = (p) => p.comprimentoMm > 0 && p.quantidade > 0;

export const consumoDasPecas = (pecas) =>
  pecas.reduce((total, p) => total + p.comprimentoMm * p.quantidade, 0) / 1000;

export default function PecasCorteDialog({ item, onClose, onSave }) {
  const [pecas, setPecas] = useState([]);

  useEffect(() => {
    if (!item) return;
    setPecas(item.pecas?.length ? item.pecas.map((p) => ({ ...novaPeca(), ...p })) : [novaPeca()]);
  }, [item]);

  const alterar = (uid, campo, valor) =>
    setPecas((prev) => prev.map((p) => (p.uid === uid ? { ...p, [campo]: valor } : p)));

  const remover = (uid) => setPecas((prev) => prev.filter((p) => p.uid !== uid));

  const validas = pecas.filter(pecaValida);
  const comprimentoBarraMm = item?.material?.tamanho ? Number(item.material.tamanho) * 1000 : null;
  const excedeBarra = (p) => Boolean(comprimentoBarraMm && p.comprimentoMm > comprimentoBarraMm);
  const algumaExcede = validas.some(excedeBarra);

  const salvar = () =>
    onSave(
      validas.map(({ descricao, comprimentoMm, quantidade }) => ({
        descricao: descricao?.trim() || null,
        comprimentoMm,
        quantidade,
      }))
    );

  return (
    <Dialog
      header={`Peças de corte — ${item?.material?.descricao || ""}`}
      visible={Boolean(item)}
      style={{ width: "min(760px, 95vw)" }}
      onHide={onClose}
    >
      <HintText>
        Informe as peças cortadas desta barra para fazer <strong>uma unidade</strong>. O consumo por unidade e os
        retalhos passam a ser calculados pelo plano de corte. Deixe sem peças para usar o consumo manual.
      </HintText>

      <DataTableStyled value={pecas} dataKey="uid" selectionMode={null} emptyMessage="Nenhuma peça adicionada.">
        <Column
          header="Peça"
          body={(p) => (
            <InputTextStyled
              value={p.descricao || ""}
              maxLength={80}
              placeholder="Ex.: Perna"
              style={{ margin: 0 }}
              onChange={(e) => alterar(p.uid, "descricao", e.target.value)}
            />
          )}
        />
        <Column
          header="Comprimento"
          style={{ width: 170 }}
          body={(p) => (
            <InputNumber
              value={p.comprimentoMm != null ? p.comprimentoMm / 10 : null}
              onValueChange={(e) => alterar(p.uid, "comprimentoMm", e.value != null ? Math.round(e.value * 10) : null)}
              min={0.1}
              maxFractionDigits={1}
              locale="pt-BR"
              useGrouping={false}
              suffix=" cm"
              placeholder="cm"
              invalid={excedeBarra(p)}
            />
          )}
        />
        <Column
          header="Qtd / unid."
          style={{ width: 130 }}
          body={(p) => (
            <InputNumber value={p.quantidade} onValueChange={(e) => alterar(p.uid, "quantidade", e.value)} min={1} />
          )}
        />
        <Column
          style={{ width: 70 }}
          body={(p) => (
            <ActionCell>
              <RemoveItemButton icon="pi pi-trash" onClick={() => remover(p.uid)} />
            </ActionCell>
          )}
        />
      </DataTableStyled>

      <ButtonStyled
        label="Adicionar peça"
        icon="pi pi-plus"
        className="p-button-text"
        onClick={() => setPecas((prev) => [...prev, novaPeca()])}
      />

      <HintText>
        Consumo por unidade:{" "}
        <strong>{consumoDasPecas(validas).toLocaleString("pt-BR", { maximumFractionDigits: 3 })} m</strong>
      </HintText>
      {algumaExcede && (
        <HintText className="erro">Há peça maior que a barra ({cm(comprimentoBarraMm)}).</HintText>
      )}

      <ButtonContainer>
        <ButtonStyled label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onClose} />
        <ButtonStyled label="Aplicar" icon="pi pi-check" disabled={algumaExcede} onClick={salvar} />
      </ButtonContainer>
    </Dialog>
  );
}
