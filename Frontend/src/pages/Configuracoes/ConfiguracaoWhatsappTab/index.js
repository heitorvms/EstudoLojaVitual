import React, { useEffect, useRef, useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { ConfiguracaoWhatsappService } from '../../../services/ConfiguracaoWhatsappService';
import WhatsappConexao from '../../../components/WhatsappConexao';
import {
  Section,
  MessageBlock,
  BlockTitle,
  BlockHint,
  PlaceholderPanel,
  PlaceholderTitle,
  PlaceholderHeader,
  PlaceholderList,
  PlaceholderChip,
  PlaceholderLegend,
  DetailsToggle,
  SaveButton,
} from './styled';

const inserirNoCursor = (ref, valorAtual, setValor, texto) => {
  const el = ref.current;
  if (!el) {
    setValor(`${valorAtual || ''}${texto}`);
    return;
  }

  const inicio = el.selectionStart ?? valorAtual?.length ?? 0;
  const fim = el.selectionEnd ?? inicio;
  const base = valorAtual || '';
  const novo = `${base.slice(0, inicio)}${texto}${base.slice(fim)}`;
  setValor(novo);

  requestAnimationFrame(() => {
    el.focus();
    const pos = inicio + texto.length;
    el.setSelectionRange(pos, pos);
  });
};

const PlaceholdersDisponiveis = ({ titulo, placeholders, onInserir }) => {
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  return (
    <PlaceholderPanel>
      <PlaceholderHeader>
        <PlaceholderTitle>{titulo}</PlaceholderTitle>
        <DetailsToggle
          type="button"
          onClick={() => setDetalhesAbertos((prev) => !prev)}
        >
          {detalhesAbertos ? 'Ocultar detalhes' : 'Mais detalhes'}
        </DetailsToggle>
      </PlaceholderHeader>
      <PlaceholderList>
        {placeholders.map((item) => (
          <PlaceholderChip
            key={item.chave}
            type="button"
            title={item.descricao}
            onClick={() => onInserir(item.chave)}
          >
            {item.chave}
          </PlaceholderChip>
        ))}
      </PlaceholderList>
      {detalhesAbertos && (
        <PlaceholderLegend>
          {placeholders.map((item) => (
            <li key={`leg-${item.chave}`}>
              <code>{item.chave}</code> — {item.descricao} (ex.: {item.exemplo})
            </li>
          ))}
        </PlaceholderLegend>
      )}
    </PlaceholderPanel>
  );
};

const ConfiguracaoWhatsappTab = () => {
  const toast = useRef(null);
  const orcamentoRef = useRef(null);
  const cobrancaRef = useRef(null);
  const service = useRef(new ConfiguracaoWhatsappService()).current;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagemOrcamento, setMensagemOrcamento] = useState('');
  const [mensagemCobranca, setMensagemCobranca] = useState('');
  const [placeholdersOrcamento, setPlaceholdersOrcamento] = useState([]);
  const [placeholdersCobranca, setPlaceholdersCobranca] = useState([]);
  const [urlWppconnect, setUrlWppconnect] = useState('http://localhost:21465');
  const [tokenWppconnect, setTokenWppconnect] = useState('');
  const [nomeSessao, setNomeSessao] = useState('hsa-serralheria');

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const data = await service.obter();
        setMensagemOrcamento(data.mensagemOrcamento || '');
        setMensagemCobranca(data.mensagemCobranca || '');
        setPlaceholdersOrcamento(data.placeholdersOrcamento || []);
        setPlaceholdersCobranca(data.placeholdersCobranca || []);
        setUrlWppconnect(data.urlWppconnect || 'http://localhost:21465');
        setTokenWppconnect(data.tokenWppconnect || '');
        setNomeSessao(data.nomeSessao || 'hsa-serralheria');
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as mensagens do WhatsApp.',
          life: 4000,
        });
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [service]);

  const salvar = async () => {
    setSaving(true);
    try {
      const data = await service.salvar({
        mensagemOrcamento,
        mensagemCobranca,
        urlWppconnect,
        tokenWppconnect,
        nomeSessao,
      });
      setMensagemOrcamento(data.mensagemOrcamento);
      setMensagemCobranca(data.mensagemCobranca);
      toast.current?.show({
        severity: 'success',
        summary: 'Salvo',
        detail: 'Mensagens do WhatsApp atualizadas.',
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error.response?.data?.message || 'Falha ao salvar as mensagens.',
        life: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <BlockHint>Carregando configurações...</BlockHint>;
  }

  return (
    <Section>
      <WhatsappConexao />
      <BlockHint>
        Configure os textos que serão usados no envio automático via WhatsApp.
        Use as variáveis abaixo no formato <code>{'{nome_cliente}'}</code> — elas serão
        substituídas pelos dados reais no momento do envio.
      </BlockHint>

      <MessageBlock>
        <BlockTitle>Conexão WPPConnect</BlockTitle>
        <BlockHint>URL, sessão e token gerados no Swagger do WPPConnect.</BlockHint>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '12px' }}>
          <div>
            <BlockHint>URL do servidor</BlockHint>
            <InputText value={urlWppconnect} onChange={(e) => setUrlWppconnect(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <BlockHint>Nome da sessão</BlockHint>
            <InputText value={nomeSessao} onChange={(e) => setNomeSessao(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <BlockHint>Token (Bearer)</BlockHint>
            <Password
              value={tokenWppconnect}
              onChange={(e) => setTokenWppconnect(e.target.value)}
              feedback={false}
              toggleMask
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
            />
          </div>
        </div>
      </MessageBlock>

      <MessageBlock>
        <BlockTitle>Envio de orçamento</BlockTitle>
        <BlockHint>
          Mensagem enviada com o PDF da cotação anexado via WPPConnect.
        </BlockHint>
        <PlaceholdersDisponiveis
          titulo="Variáveis disponíveis"
          placeholders={placeholdersOrcamento}
          onInserir={(chave) =>
            inserirNoCursor(orcamentoRef, mensagemOrcamento, setMensagemOrcamento, chave)
          }
        />
        <InputTextarea
          inputRef={orcamentoRef}
          value={mensagemOrcamento}
          onChange={(e) => setMensagemOrcamento(e.target.value)}
          rows={10}
          autoResize
          style={{ width: '100%' }}
        />
      </MessageBlock>

      <MessageBlock>
        <BlockTitle>Mensagem de cobrança</BlockTitle>
        <BlockHint>
          Texto para lembrete ou cobrança relacionada a um orçamento pendente.
        </BlockHint>
        <PlaceholdersDisponiveis
          titulo="Variáveis disponíveis"
          placeholders={placeholdersCobranca}
          onInserir={(chave) =>
            inserirNoCursor(cobrancaRef, mensagemCobranca, setMensagemCobranca, chave)
          }
        />
        <InputTextarea
          inputRef={cobrancaRef}
          value={mensagemCobranca}
          onChange={(e) => setMensagemCobranca(e.target.value)}
          rows={10}
          autoResize
          style={{ width: '100%' }}
        />
      </MessageBlock>

      <SaveButton
        label={saving ? 'Salvando...' : 'Salvar mensagens'}
        icon="pi pi-save"
        onClick={salvar}
        disabled={saving}
      />
      <Toast ref={toast} />
    </Section>
  );
};

export default ConfiguracaoWhatsappTab;
