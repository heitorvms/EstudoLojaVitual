import React from "react";
import { FaShoppingCart, FaClipboardList, FaBoxes } from "react-icons/fa";
import { PageShellCentered, PageHeader, HeaderText } from "../../styles/oficinaLayout";
import { FeatureGrid, FeatureCard } from "./styled";

const FEATURES = [
  { icon: FaShoppingCart, texto: "Monte cotações e orçamentos" },
  { icon: FaClipboardList, texto: "Acompanhe as ordens de serviço" },
  { icon: FaBoxes, texto: "Controle estoque e retalhos" },
];

const Page = () => (
  <PageShellCentered>
    <PageHeader>
      <HeaderText>
        <h1>Seja bem-vindo</h1>
        <p>Aqui você gerencia orçamentos, produção e estoque da serralheria. Use o menu lateral para navegar.</p>
      </HeaderText>
    </PageHeader>
    <FeatureGrid>
      {FEATURES.map(({ icon: Icon, texto }) => (
        <FeatureCard key={texto}>
          <Icon size={40} />
          <p>{texto}</p>
        </FeatureCard>
      ))}
    </FeatureGrid>
  </PageShellCentered>
);

export default Page;
