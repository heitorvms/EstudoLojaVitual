import React, { useState, useRef, useEffect, useCallback } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DistribuidoraService } from "../../services/DistribuidoraService";
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  ButtonPrimary,
  ButtonSecondary,
  PanelCard,
  PanelTitle,
  ToolbarRow,
  DataTableStyled,
  IconActionButton,
} from "../../styles/oficinaLayout";

const ROWS_PER_PAGE = 10;

const Distribuidoras = () => {
  const [nome, setNome] = useState("");
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [editingDistribuidora, setEditingDistribuidora] = useState(null);
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const toast = useRef(null);
  const distribuidoraService = useRef(new DistribuidoraService()).current;

  const fetchDistribuidoras = useCallback(async () => {
    const result = await distribuidoraService.getPaginado(first / ROWS_PER_PAGE, ROWS_PER_PAGE);
    if (result.success) {
      setDistribuidoras(result.data.content || []);
      setTotalRecords(result.data.totalElements || 0);
    } else {
      toast.current.show(result.message);
      setDistribuidoras([]);
      setTotalRecords(0);
    }
  }, [first, distribuidoraService]);

  useEffect(() => {
    fetchDistribuidoras();
  }, [fetchDistribuidoras]);

  const cancelEdit = () => {
    setEditingDistribuidora(null);
    setNome("");
  };

  const saveDistribuidora = async () => {
    const result = editingDistribuidora
      ? await distribuidoraService.putRequest(editingDistribuidora.id, { nome })
      : await distribuidoraService.postRequest({ nome });
    if (result.success) {
      cancelEdit();
      fetchDistribuidoras();
    }
    toast.current.show(result.message);
  };

  const confirmRemove = (distribuidora) => {
    confirmDialog({
      header: "Excluir distribuidora",
      message: `Excluir a distribuidora ${distribuidora.nome}?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim",
      rejectLabel: "Não",
      acceptClassName: "p-button-danger",
      accept: async () => {
        const result = await distribuidoraService.deleteRequest(distribuidora.id);
        if (result.success) {
          if (editingDistribuidora?.id === distribuidora.id) cancelEdit();
          fetchDistribuidoras();
        }
        toast.current.show(result.message);
      },
    });
  };

  const startEditing = (distribuidora) => {
    setEditingDistribuidora(distribuidora);
    setNome(distribuidora.nome);
  };

  const actionsBodyTemplate = (rowData) => (
    <div style={{ display: "flex", gap: 6 }}>
      <IconActionButton
        icon="pi pi-pencil"
        className="btn-warning"
        tooltip="Editar"
        tooltipOptions={{ position: "top" }}
        onClick={() => startEditing(rowData)}
      />
      <IconActionButton
        icon="pi pi-trash"
        className="btn-delete"
        tooltip="Excluir"
        tooltipOptions={{ position: "top" }}
        onClick={() => confirmRemove(rowData)}
      />
    </div>
  );

  return (
    <PageShell className="oficina-page">
      <OficinaGlobalStyle />
      <ContainerPage>
        <Toast ref={toast} />
        <ConfirmDialog />
        <PageHeader>
          <HeaderText>
            <h1>Distribuidoras</h1>
            <p>Fornecedores usados nas cotações de preço e nas compras de estoque</p>
          </HeaderText>
        </PageHeader>

        <PanelCard>
          <PanelTitle>{editingDistribuidora ? "Editar distribuidora" : "Nova distribuidora"}</PanelTitle>
          <ToolbarRow>
            <InputText
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveDistribuidora()}
              placeholder="Nome da distribuidora"
              style={{ flex: 1, minWidth: 220 }}
            />
            <ButtonPrimary
              label={editingDistribuidora ? "Salvar" : "Adicionar"}
              icon={editingDistribuidora ? "pi pi-save" : "pi pi-plus"}
              onClick={saveDistribuidora}
            />
            {editingDistribuidora && <ButtonSecondary label="Cancelar" onClick={cancelEdit} />}
          </ToolbarRow>
        </PanelCard>

        <PanelCard>
          <PanelTitle>Lista</PanelTitle>
          <DataTableStyled
            value={distribuidoras}
            lazy
            paginator
            first={first}
            rows={ROWS_PER_PAGE}
            totalRecords={totalRecords}
            onPage={(e) => setFirst(e.first)}
            emptyMessage="Nenhuma distribuidora encontrada"
          >
            <Column field="nome" header="Nome" />
            <Column header="Ações" body={actionsBodyTemplate} style={{ width: 130 }} />
          </DataTableStyled>
        </PanelCard>
      </ContainerPage>
    </PageShell>
  );
};

export default Distribuidoras;
