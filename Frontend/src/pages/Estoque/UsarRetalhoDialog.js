import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { ButtonPrimary, ButtonSecondary, DialogForm, FooterActions } from "../../styles/oficinaLayout";
import { descreverRetalho } from "../../utils/planoCorte";

export default function UsarRetalhoDialog({ retalho, loading, onConfirm, onHide }) {
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    if (retalho) setQuantidade(1);
  }, [retalho]);

  return (
    <Dialog
      header={retalho ? `Usar retalho — ${retalho.material}` : ""}
      visible={Boolean(retalho)}
      onHide={onHide}
      style={{ width: "min(420px, 95vw)" }}
    >
      {retalho && (
        <DialogForm>
          <p>Disponível: {descreverRetalho(retalho)}</p>
          <div>
            <label htmlFor="quantidadeRetalho">Quantidade usada</label>
            <InputNumber
              inputId="quantidadeRetalho"
              value={quantidade}
              onValueChange={(e) => setQuantidade(e.value)}
              min={1}
              max={retalho.quantidade}
              showButtons
            />
          </div>
        </DialogForm>
      )}
      <FooterActions>
        <ButtonSecondary label="Voltar" icon="pi pi-arrow-left" onClick={onHide} />
        <ButtonPrimary
          label="Confirmar"
          icon="pi pi-check"
          loading={loading}
          disabled={!quantidade}
          onClick={() => onConfirm(quantidade)}
        />
      </FooterActions>
    </Dialog>
  );
}
