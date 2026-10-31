import React, { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { CompraEstoqueService } from "../../services/CompraEstoqueService";
import { RetalhoService } from "../../services/RetalhoService";
import { cm } from "../../utils/planoCorte";
import { moeda } from "../../utils/moeda";
import UsarRetalhoDialog from "./UsarRetalhoDialog";
import useListaPaginada from "./useListaPaginada";
import HistoricoMaterial, { formatarData, metrosDaBarra } from "./HistoricoMaterial";
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  PanelCard,
  DataTableStyled,
  IconActionButton,
  TabsWrap,
  ToolbarRow,
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

const CampoBusca = ({ valor, aoAlterar }) => (
  <ToolbarRow>
    <InputText
      value={valor}
      onChange={(e) => aoAlterar(e.target.value)}
      placeholder="Buscar material..."
      style={{ width: "min(360px, 100%)" }}
    />
  </ToolbarRow>
);

export default function Estoque() {
  const toast = useRef(null);
  const service = useRef(new CompraEstoqueService()).current;
  const retalhoService = useRef(new RetalhoService()).current;
  const estoque = useListaPaginada(
    useCallback((pagina, tamanho, busca) => service.listarEstoque(pagina, tamanho, busca), [service]),
    useCallback(() => mostrarErro(toast, "Falha ao carregar estoque"), [])
  );
  const retalhos = useListaPaginada(
    useCallback((pagina, tamanho, busca) => retalhoService.listar(pagina, tamanho, busca), [retalhoService]),
    useCallback(() => mostrarErro(toast, "Falha ao carregar retalhos"), [])
  );
  const [retalhoEmUso, setRetalhoEmUso] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [linhasExpandidas, setLinhasExpandidas] = useState(null);
  const [historicos, setHistoricos] = useState({});

  const carregarHistorico = ({ data }) => {
    const materialId = data.materialDisponivelId;
    if (historicos[materialId]) return;
    service
      .historicoEstoque(materialId)
      .then((historico) => setHistoricos((atual) => ({ ...atual, [materialId]: historico })))
      .catch(() => mostrarErro(toast, "Falha ao carregar histórico do material"));
  };

  const usarRetalho = async (quantidade) => {
    setSalvando(true);
    try {
      await retalhoService.usar(retalhoEmUso.id, quantidade);
      setRetalhoEmUso(null);
      await retalhos.recarregar();
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
            <p>Saldo de barras por material e retalhos da oficina</p>
          </HeaderText>
        </PageHeader>

        <PanelCard>
          <TabsWrap>
            <TabView>
              <TabPanel header="Material em estoque">
                <CampoBusca valor={estoque.busca} aoAlterar={estoque.setBusca} />
                <DataTableStyled
                  {...estoque.tabelaProps}
                  dataKey="materialDisponivelId"
                  expandedRows={linhasExpandidas}
                  onRowToggle={(e) => setLinhasExpandidas(e.data)}
                  onRowExpand={carregarHistorico}
                  rowExpansionTemplate={(r) => <HistoricoMaterial historico={historicos[r.materialDisponivelId]} />}
                  emptyMessage={estoque.busca ? "Nenhum material encontrado" : "Estoque vazio — registre uma compra de lote"}
                >
                  <Column expander style={{ width: 48 }} />
                  <Column field="material" header="Material" />
                  <Column field="barras" header="Barras" body={(r) => saldo(r.barras)} />
                  <Column header="Barra" body={(r) => metrosDaBarra(r.comprimentoBarraMm)} />
                  <Column field="metros" header="Metros" body={(r) => saldo(r.metros, 2, " m")} />
                  <Column header="Custo médio/barra" body={(r) => (r.custoMedioBarra != null ? moeda(r.custoMedioBarra) : "-")} />
                  <Column header="Valor em estoque" body={(r) => moeda(r.valorEstoque)} />
                </DataTableStyled>
              </TabPanel>

              <TabPanel header="Retalhos">
                <CampoBusca valor={retalhos.busca} aoAlterar={retalhos.setBusca} />
                <DataTableStyled {...retalhos.tabelaProps} dataKey="id" emptyMessage="Nenhum retalho encontrado">
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
                  <Column header="Gerado em" body={(r) => formatarData(r.dataCriacao)} />
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
              </TabPanel>
            </TabView>
          </TabsWrap>
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
