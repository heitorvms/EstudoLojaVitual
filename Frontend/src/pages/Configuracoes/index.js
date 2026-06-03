import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import GerenciamentoPerfilUsuario from '../GerenciamentoPerfilUsuario';
import ConfiguracaoWhatsappTab from './ConfiguracaoWhatsappTab';
import { ContainerPage, TitlePage, TabContent } from './styled';

const Configuracoes = () => (
  <ContainerPage>
    <TitlePage>Configurações do Sistema</TitlePage>
    <TabView>
      <TabPanel header="Usuários e Permissões">
        <TabContent>
          <GerenciamentoPerfilUsuario embedded />
        </TabContent>
      </TabPanel>
      <TabPanel header="WhatsApp">
        <TabContent>
          <ConfiguracaoWhatsappTab />
        </TabContent>
      </TabPanel>
    </TabView>
  </ContainerPage>
);

export default Configuracoes;
