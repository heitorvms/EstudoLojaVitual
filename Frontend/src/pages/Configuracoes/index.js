import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import GerenciamentoPerfilUsuario from '../GerenciamentoPerfilUsuario';
import ConfiguracaoWhatsappTab from './ConfiguracaoWhatsappTab';
import ConfiguracaoProducaoTab from './ConfiguracaoProducaoTab';
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  PanelCard,
} from '../../styles/oficinaLayout';

const Configuracoes = () => (
  <PageShell className="oficina-page">
    <OficinaGlobalStyle />
    <ContainerPage>
      <PageHeader>
        <HeaderText>
          <h1>Configurações do Sistema</h1>
          <p>Usuários e permissões, integração com WhatsApp e parâmetros de produção</p>
        </HeaderText>
      </PageHeader>
      <PanelCard>
        <TabView>
          <TabPanel header="Usuários e Permissões">
            <GerenciamentoPerfilUsuario embedded />
          </TabPanel>
          <TabPanel header="WhatsApp">
            <ConfiguracaoWhatsappTab />
          </TabPanel>
          <TabPanel header="Produção">
            <ConfiguracaoProducaoTab />
          </TabPanel>
        </TabView>
      </PanelCard>
    </ContainerPage>
  </PageShell>
);

export default Configuracoes;
