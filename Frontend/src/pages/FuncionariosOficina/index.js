import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { FuncionarioOficinaService } from "../../services/FuncionarioOficinaService";
import ResumoFuncionarioDialog from "./ResumoFuncionarioDialog";
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
  FormGrid,
  DataTableStyled,
} from "../../styles/oficinaLayout";

const empty = { nome: "", telefone: "", cargo: "", valorHora: 0, valorHoraNoturno: 0, ativo: true };

const moeda = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

export default function FuncionariosOficina() {
  const toast = useRef(null);
  const service = useRef(new FuncionarioOficinaService()).current;
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [funcionarioResumo, setFuncionarioResumo] = useState(null);

  const load = async () => {
    try {
      setRows(await service.listar(false));
    } catch {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao listar", life: 3000 });
    }
  };

  useEffect(() => { load(); }, []);

  const salvar = async () => {
    if (!form.nome?.trim()) {
      toast.current.show({ severity: "warn", summary: "Atenção", detail: "Nome obrigatório", life: 2500 });
      return;
    }
    try {
      if (editingId) await service.atualizar(editingId, form);
      else await service.criar(form);
      setForm(empty);
      setEditingId(null);
      load();
      toast.current.show({ severity: "success", summary: "OK", detail: "Salvo", life: 2000 });
    } catch {
      toast.current.show({ severity: "error", summary: "Erro", detail: "Falha ao salvar", life: 3000 });
    }
  };

  const excluir = (funcionario) => {
    confirmDialog({
      header: "Excluir funcionário",
      message: `Excluir ${funcionario.nome}? Se houver horas lançadas, ele será apenas desativado.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim",
      rejectLabel: "Não",
      accept: async () => {
        try {
          const res = await service.excluir(funcionario.id);
          toast.current.show({
            severity: res?.desativado ? "info" : "success",
            summary: res?.desativado ? "Desativado" : "OK",
            detail: res?.message,
            life: 4000,
          });
          load();
        } catch {
          toast.current.show({ severity: "error", summary: "Erro", detail: "Falha ao excluir", life: 3000 });
        }
      },
    });
  };

  return (
    <PageShell className="oficina-page">
      <OficinaGlobalStyle />
      <ContainerPage>
        <Toast ref={toast} />
        <ConfirmDialog />
        <PageHeader>
          <HeaderText>
            <h1>Funcionários da Oficina</h1>
            <p>Cadastro para lançamento de mão de obra por hora</p>
          </HeaderText>
        </PageHeader>

        <PanelCard>
          <PanelTitle>{editingId ? "Editar funcionário" : "Novo funcionário"}</PanelTitle>
          <FormGrid>
            <div>
              <label>Nome</label>
              <InputText value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label>Telefone</label>
              <InputText value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <label>Cargo</label>
              <InputText value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Soldador, pintor..." />
            </div>
            <div>
              <label>Valor/hora</label>
              <InputNumber value={form.valorHora} onValueChange={(e) => setForm({ ...form, valorHora: e.value || 0 })} mode="currency" currency="BRL" locale="pt-BR" />
            </div>
            <div>
              <label>Valor/hora noturno</label>
              <InputNumber value={form.valorHoraNoturno} onValueChange={(e) => setForm({ ...form, valorHoraNoturno: e.value || 0 })} mode="currency" currency="BRL" locale="pt-BR" />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, paddingBottom: 8 }}>
              <Checkbox inputId="ativo" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.checked })} />
              <label htmlFor="ativo" style={{ margin: 0 }}>Ativo</label>
            </div>
          </FormGrid>
          <div style={{ display: "flex", gap: 8 }}>
            <ButtonPrimary label={editingId ? "Atualizar" : "Adicionar"} icon="pi pi-save" onClick={salvar} />
            {editingId && <ButtonSecondary label="Cancelar" onClick={() => { setEditingId(null); setForm(empty); }} />}
          </div>
        </PanelCard>

        <PanelCard>
          <PanelTitle>Lista</PanelTitle>
          <DataTableStyled value={rows} emptyMessage="Nenhum funcionário">
            <Column field="nome" header="Nome" />
            <Column field="telefone" header="Telefone" />
            <Column field="cargo" header="Cargo" />
            <Column field="valorHora" header="R$/h" body={(r) => moeda(r.valorHora)} />
            <Column field="valorHoraNoturno" header="R$/h noturno" body={(r) => moeda(r.valorHoraNoturno)} />
            <Column field="ativo" header="Ativo" body={(r) => (r.ativo ? "Sim" : "Não")} />
            <Column
              header=""
              style={{ width: 150 }}
              body={(r) => (
                <>
                  <ButtonSecondary
                    icon="pi pi-chart-bar"
                    className="p-button-rounded p-button-text"
                    tooltip="Ganhos e serviços"
                    tooltipOptions={{ position: "top" }}
                    onClick={() => setFuncionarioResumo(r)}
                  />
                  <ButtonSecondary
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text"
                    onClick={() => {
                      setEditingId(r.id);
                      setForm({
                        nome: r.nome,
                        telefone: r.telefone || "",
                        cargo: r.cargo || "",
                        valorHora: r.valorHora,
                        valorHoraNoturno: r.valorHoraNoturno || 0,
                        ativo: r.ativo,
                      });
                    }}
                  />
                  <ButtonSecondary
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text p-button-danger"
                    onClick={() => excluir(r)}
                  />
                </>
              )}
            />
          </DataTableStyled>
        </PanelCard>

        <ResumoFuncionarioDialog
          funcionario={funcionarioResumo}
          service={service}
          toast={toast}
          onHide={() => setFuncionarioResumo(null)}
        />
      </ContainerPage>
    </PageShell>
  );
}
