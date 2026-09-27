import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";
import { CompraEstoqueService } from "../../services/CompraEstoqueService";
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  PanelCard,
  PanelTitle,
  DataTableStyled,
} from "../../styles/oficinaLayout";

export default function Estoque() {
  const toast = useRef(null);
  const service = useRef(new CompraEstoqueService()).current;
  const [estoque, setEstoque] = useState([]);

  useEffect(() => {
    service
      .listarEstoque()
      .then(setEstoque)
      .catch(() =>
        toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao carregar estoque", life: 3000 })
      );
  }, [service]);

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
            <Column field="barras" header="Barras" />
            <Column field="metros" header="Metros" body={(r) => Number(r.metros || 0).toFixed(3)} />
            <Column field="quantidadeKg" header="Kg" body={(r) => Number(r.quantidadeKg || 0).toFixed(3)} />
          </DataTableStyled>
        </PanelCard>
      </ContainerPage>
    </PageShell>
  );
}
