import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { CompraEstoqueService } from "../../services/CompraEstoqueService";
import { RetalhoService } from "../../services/RetalhoService";
import { cm } from "../../utils/planoCorte";
import UsarRetalhoDialog from "./UsarRetalhoDialog";
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  PanelCard,
  PanelTitle,
  DataTableStyled,
  IconActionButton,
} from "../../styles/oficinaLayout";

const mostrarErro = (toast, detail) =>
  toast.current?.show({ severity: "error", summary: "Erro", detail, life: 3000 });

const saldo = (valor, casas = 0, unidade = "") => {
  const numero = Number(valor || 0);
  return numero < 0 ? (
    <Tag severity="danger" value={`Faltam ${(-numero).toFixed(casas)}${unidade}`} />
  ) : (
    numero.toFixed(casas)
  );
};

export default function Estoque() {
  const toast = useRef(null);
  const service = useRef(new CompraEstoqueService()).current;
  const retalhoService = useRef(new RetalhoService()).current;
  const [estoque, setEstoque] = useState([]);
  const [retalhos, setRetalhos] = useState([]);
  const [retalhoEmUso, setRetalhoEmUso] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregarRetalhos = useCallback(
    () => retalhoService.listar().then(setRetalhos).catch(() => mostrarErro(toast, "Falha ao carregar retalhos")),
    [retalhoService]
  );

  useEffect(() => {
    service
      .listarEstoque()
      .then(setEstoque)
      .catch(() => mostrarErro(toast, "Falha ao carregar estoque"));
    carregarRetalhos();
  }, [service, carregarRetalhos]);

  const usarRetalho = async (quantidade) => {
    setSalvando(true);
    try {
      await retalhoService.usar(retalhoEmUso.id, quantidade);
      setRetalhoEmUso(null);
      await carregarRetalhos();
    } catch (e) {
      mostrarErro(toast, e.response?.data?.message || "Falha ao usar retalho");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageShell className="oficina-page">
      <OficinaGlobalStyle />
      <ContainerPage>
        <Toast ref={toast} />
        <PageHeader>
          <HeaderText>
            <h1>Estoque</h1>
            <p>Saldo de barras, metros e kg por material</p>
          </HeaderText>
        </PageHeader>

        <PanelCard>
          <PanelTitle>Materiais em estoque</PanelTitle>
          <DataTableStyled value={estoque} emptyMessage="Estoque vazio — registre uma compra de lote">
            <Column header="Material" body={(r) => r.materialDisponivel?.descricao || "-"} />
            <Column field="barras" header="Barras" body={(r) => saldo(r.barras)} />
            <Column field="metros" header="Metros" body={(r) => saldo(r.metros, 3, " m")} />
            <Column field="quantidadeKg" header="Kg" body={(r) => saldo(r.quantidadeKg, 3, " kg")} />
          </DataTableStyled>
        </PanelCard>

        <PanelCard>
          <PanelTitle>Retalhos disponíveis</PanelTitle>
          <DataTableStyled value={retalhos} emptyMessage="Nenhum retalho na oficina">
            <Column field="material" header="Material" />
            <Column header="Comprimento" body={(r) => cm(r.comprimentoMm)} />
            <Column field="quantidade" header="Quantidade" />
            <Column
              header="Origem"
              body={(r) =>
                r.ordemServicoId ? (
                  <Link to={`/ordens-servico/${r.ordemServicoId}`}>{`OS #${r.ordemServicoId} — ${r.ordemServicoNome}`}</Link>
                ) : (
                  "-"
                )
              }
            />
            <Column header="Gerado em" body={(r) => new Date(r.dataCriacao).toLocaleDateString("pt-BR")} />
            <Column
              header="Ações"
              style={{ width: 80 }}
              body={(r) => (
                <IconActionButton
                  icon="pi pi-minus-circle"
                  className="btn-warning"
                  tooltip="Usar retalho"
                  onClick={() => setRetalhoEmUso(r)}
                />
              )}
            />
          </DataTableStyled>
        </PanelCard>

        <UsarRetalhoDialog
          retalho={retalhoEmUso}
          loading={salvando}
          onConfirm={usarRetalho}
          onHide={() => setRetalhoEmUso(null)}
        />
      </ContainerPage>
    </PageShell>
  );
}
