import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { CompraEstoqueService } from "../../services/CompraEstoqueService";
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  HeaderActions,
  ButtonPrimary,
  ButtonSecondary,
  PanelCard,
  PanelTitle,
  ToolbarRow,
  DataTableStyled,
  DialogForm,
} from "../../styles/oficinaLayout";

export default function ComprasLote() {
  const toast = useRef(null);
  const navigate = useNavigate();
  const service = useRef(new CompraEstoqueService()).current;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);

  const load = async (p = page, size = rowsPerPage) => {
    try {
      const data = await service.listarCompras(p, size, query);
      setRows(data.content || []);
      setTotal(data.totalElements || 0);
      setSelected(null);
    } catch {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao listar compras", life: 3000 });
    }
  };

  useEffect(() => {
    load(0, rowsPerPage);
    setPage(0);
  }, [rowsPerPage]);

  const abrirCancelar = () => {
    if (!selected) {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Selecione uma compra na lista", life: 2500 });
      return;
    }
    if (selected.status === "CANCELADA") {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Esta compra já está cancelada", life: 2500 });
      return;
    }
    setMotivo("");
    setCancelDialog(true);
  };

  const confirmarCancelar = async () => {
    if (!motivo.trim()) {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Motivo obrigatório", life: 2500 });
      return;
    }
    setCancelando(true);
    try {
      await service.cancelarCompra(selected.id, motivo.trim());
      setCancelDialog(false);
      toast.current?.show({ severity: "success", summary: "OK", detail: "Compra cancelada e estoque estornado", life: 3000 });
      load(page, rowsPerPage);
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || "Falha ao cancelar",
        life: 4000,
      });
    } finally {
      setCancelando(false);
    }
  };

  const editar = () => {
    if (!selected) {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Selecione uma compra na lista", life: 2500 });
      return;
    }
    if (selected.status === "CANCELADA") {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Não é possível editar compra cancelada", life: 2500 });
      return;
    }
    navigate(`/compras-lote/${selected.id}/editar`);
  };

  const formatDate = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
  };

  return (
    <PageShell className="oficina-page">
      <OficinaGlobalStyle />
      <ContainerPage>
        <Toast ref={toast} />
        <PageHeader>
          <HeaderText>
            <h1>Compra de Material</h1>
            <p>Entradas de lote que alimentam o estoque da oficina</p>
          </HeaderText>
        </PageHeader>

        <PanelCard>
          <PanelTitle>Lista de compras</PanelTitle>
          <ToolbarRow>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
                Buscar
              </label>
              <InputText
                placeholder="Nota, distribuidora ou observação..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: "100%" }}
                onKeyDown={(e) => e.key === "Enter" && (setPage(0), load(0, rowsPerPage))}
              />
            </div>
            <ButtonPrimary
              label="Buscar"
              icon="pi pi-search"
              onClick={() => { setPage(0); load(0, rowsPerPage); }}
              style={{ alignSelf: "flex-end" }}
            />
          </ToolbarRow>

          <DataTableStyled
            value={rows}
            selectionMode="single"
            selection={selected}
            onSelectionChange={(e) => setSelected(e.value)}
            dataKey="id"
            paginator
            rows={rowsPerPage}
            totalRecords={total}
            lazy
            first={page * rowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            onPage={(e) => {
              setPage(e.page);
              setRowsPerPage(e.rows);
              load(e.page, e.rows);
            }}
            emptyMessage="Nenhuma compra registrada"
          >
            <Column field="id" header="Nº" style={{ width: 70 }} />
            <Column field="numeroNota" header="Nota" body={(r) => r.numeroNota || "-"} />
            <Column header="Distribuidora" body={(r) => r.distribuidora?.nome || "-"} />
            <Column header="Data" body={(r) => formatDate(r.dataCompra)} />
            <Column header="Itens" body={(r) => r.itens?.length || 0} style={{ width: 80 }} />
            <Column
              header="Total"
              body={(r) => `R$ ${Number(r.valorTotal || 0).toFixed(2)}`}
            />
            <Column
              header="Status"
              body={(r) => (
                <Tag
                  value={r.status === "CANCELADA" ? "Cancelada" : "Ativa"}
                  severity={r.status === "CANCELADA" ? "danger" : "success"}
                />
              )}
            />
          </DataTableStyled>

          <HeaderActions style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <ButtonPrimary
              label="Criar compra"
              icon="pi pi-plus"
              onClick={() => navigate("/compras-lote/nova")}
            />
            <ButtonSecondary label="Editar" icon="pi pi-pencil" onClick={editar} disabled={!selected} />
            <ButtonSecondary
              label="Cancelar compra"
              icon="pi pi-times"
              onClick={abrirCancelar}
              disabled={!selected || selected?.status === "CANCELADA"}
            />
          </HeaderActions>
        </PanelCard>

        <Dialog
          header="Cancelar compra"
          visible={cancelDialog}
          style={{ width: "480px", maxWidth: "95vw" }}
          onHide={() => setCancelDialog(false)}
          footer={
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <ButtonSecondary label="Voltar" onClick={() => setCancelDialog(false)} />
              <ButtonPrimary label="Confirmar cancelamento" loading={cancelando} onClick={confirmarCancelar} />
            </div>
          }
        >
          <DialogForm>
            <p style={{ margin: "0 0 12px", color: "#444", fontSize: 14 }}>
              A compra #{selected?.id} será cancelada e o estoque correspondente será estornado.
            </p>
            <div>
              <label htmlFor="motivo">Motivo do cancelamento *</label>
              <InputTextarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo (obrigatório)"
                autoFocus
              />
            </div>
          </DialogForm>
        </Dialog>
      </ContainerPage>
    </PageShell>
  );
}
