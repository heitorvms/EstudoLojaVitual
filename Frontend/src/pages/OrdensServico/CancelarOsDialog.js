import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { ButtonPrimary, ButtonSecondary, FooterActions } from "../../styles/oficinaLayout";

export default function CancelarOsDialog({ os, visible, loading, onConfirm, onHide }) {
  const [devolverEstoque, setDevolverEstoque] = useState(true);

  useEffect(() => {
    if (visible) setDevolverEstoque(true);
  }, [visible]);

  return (
    <Dialog
      header={os ? `Cancelar OS #${os.id}` : ""}
      visible={visible}
      onHide={onHide}
      style={{ width: "min(480px, 95vw)" }}
    >
      <p>Tem certeza que deseja cancelar este serviço? As contas em aberto no financeiro serão canceladas.</p>
      {os?.estoqueBaixado && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Checkbox
            inputId="devolverEstoque"
            checked={devolverEstoque}
            onChange={(e) => setDevolverEstoque(e.checked)}
          />
          <label htmlFor="devolverEstoque">Devolver os materiais ao estoque (não foram usados)</label>
        </div>
      )}
      <FooterActions>
        <ButtonSecondary label="Voltar" icon="pi pi-arrow-left" onClick={onHide} />
        <ButtonPrimary
          label="Cancelar serviço"
          icon="pi pi-times-circle"
          loading={loading}
          onClick={() => onConfirm(Boolean(os?.estoqueBaixado && devolverEstoque))}
        />
      </FooterActions>
    </Dialog>
  );
}
