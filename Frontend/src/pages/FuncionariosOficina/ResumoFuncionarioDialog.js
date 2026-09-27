import React, { useCallback, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { statusLabel, statusSeverity } from "../OrdensServico/statusOrdemServico";
import { formatarDataIso, paraIsoData } from "../../utils/datas";
import {
  ButtonPrimary,
  ButtonSecondary,
  DataTableStyled,
  FormGrid,
  InfoGrid,
  InfoItem,
} from "../../styles/oficinaLayout";

const moeda = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

const mesAtual = () => {
  const hoje = new Date();
  return [new Date(hoje.getFullYear(), hoje.getMonth(), 1), new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)];
};

export default function ResumoFuncionarioDialog({ funcionario, service, toast, onHide }) {
  const [periodo, setPeriodo] = useState(mesAtual);
  const [resumo, setResumo] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const [inicio, fim] = periodo || [];
  const inicioIso = paraIsoData(inicio);
  const fimIso = paraIsoData(fim);

  const carregar = useCallback(async () => {
    if (!funcionario || !inicioIso || !fimIso) return;
    try {
      setResumo(await service.resumo(funcionario.id, inicioIso, fimIso));
      setSelecionados([]);
    } catch {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao carregar resumo", life: 3000 });
    }
  }, [funcionario, service, toast, inicioIso, fimIso]);

  useEffect(() => {
    if (funcionario) setPeriodo(mesAtual());
  }, [funcionario]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const registrarPagamento = async (pago) => {
    const ids = selecionados.filter((l) => l.pago !== pago).map((l) => l.id);
    if (!ids.length) return;
    setSalvando(true);
    try {
      await service.registrarPagamento(funcionario.id, ids, pago);
      toast.current?.show({
        severity: "success",
        summary: "OK",
        detail: pago ? "Lançamentos marcados como pagos" : "Pagamento desfeito",
        life: 2500,
      });
      await carregar();
    } catch {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao registrar pagamento", life: 3000 });
    } finally {
      setSalvando(false);
    }
  };

  const totalSelecionado = selecionados.reduce((soma, l) => soma + Number(l.valorTotal || 0), 0);

  return (
    <Dialog
      header={funcionario ? `Ganhos e serviços — ${funcionario.nome}` : ""}
      visible={Boolean(funcionario)}
      onHide={onHide}
      style={{ width: "min(1000px, 95vw)" }}
    >
      <FormGrid>
        <div>
          <label>Período</label>
          <Calendar
            value={periodo}
            onChange={(e) => setPeriodo(e.value)}
            selectionMode="range"
            dateFormat="dd/mm/yy"
            readOnlyInput
            showIcon
          />
        </div>
      </FormGrid>
      {resumo && (
        <>
          <InfoGrid>
            <InfoItem>
              <strong>Total no período</strong>
              <span>{moeda(resumo.totalValor)}</span>
            </InfoItem>
            <InfoItem>
              <strong>Já pago</strong>
              <span style={{ color: "#15803d" }}>{moeda(resumo.totalPago)}</span>
            </InfoItem>
            <InfoItem>
              <strong>A pagar</strong>
              <span style={{ color: "#b45309" }}>{moeda(resumo.totalPendente)}</span>
            </InfoItem>
            <InfoItem>
              <strong>Horas (noturnas)</strong>
              <span>
                {Number(resumo.totalHoras || 0).toFixed(2)} h ({Number(resumo.totalHorasNoturnas || 0).toFixed(2)} h)
              </span>
            </InfoItem>
            <InfoItem>
              <strong>Serviços</strong>
              <span>{resumo.totalServicos}</span>
            </InfoItem>
          </InfoGrid>
          <div style={{ marginTop: 16 }}>
            <DataTableStyled
              value={resumo.lancamentos}
              selectionMode="checkbox"
              selection={selecionados}
              onSelectionChange={(e) => setSelecionados(e.value)}
              dataKey="id"
              emptyMessage="Nenhuma hora lançada no período"
            >
              <Column selectionMode="multiple" style={{ width: 48 }} />
              <Column header="Data" body={(l) => formatarDataIso(l.dataTrabalho)} />
              <Column header="OS" body={(l) => `#${l.ordemServicoId}`} style={{ width: 70 }} />
              <Column field="servicoNome" header="Serviço" />
              <Column field="clienteNome" header="Cliente" />
              <Column header="Status" body={(l) => <Tag value={statusLabel(l.status)} severity={statusSeverity(l.status)} />} />
              <Column header="Turno" body={(l) => (l.noturno ? "Noturno" : "Diurno")} />
              <Column field="horas" header="Horas" />
              <Column header="Total" body={(l) => moeda(l.valorTotal)} />
              <Column
                header="Pagamento"
                body={(l) =>
                  l.pago ? (
                    <Tag value={`Pago ${formatarDataIso(l.dataPagamento)}`} severity="success" />
                  ) : (
                    <Tag value="A pagar" severity="warning" />
                  )
                }
              />
            </DataTableStyled>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
            <ButtonPrimary
              label={`Marcar como pago${selecionados.length ? ` (${moeda(totalSelecionado)})` : ""}`}
              icon="pi pi-check"
              loading={salvando}
              disabled={!selecionados.some((l) => !l.pago)}
              onClick={() => registrarPagamento(true)}
            />
            <ButtonSecondary
              label="Desfazer pagamento"
              icon="pi pi-undo"
              disabled={salvando || !selecionados.some((l) => l.pago)}
              onClick={() => registrarPagamento(false)}
            />
          </div>
        </>
      )}
    </Dialog>
  );
}
