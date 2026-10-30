import React, { useEffect, useRef, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ConfiguracaoProducaoService } from '../../services/ConfiguracaoProducaoService';
import {
  Section,
  MessageBlock,
  BlockTitle,
  BlockHint,
  SaveButton,
} from './ConfiguracaoWhatsappTab/styled';

const ConfiguracaoProducaoTab = () => {
  const toast = useRef(null);
  const service = useRef(new ConfiguracaoProducaoService()).current;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [espessuraCorteMm, setEspessuraCorteMm] = useState(3);
  const [retalhoMinimoMm, setRetalhoMinimoMm] = useState(100);

  useEffect(() => {
    service
      .obter()
      .then((data) => {
        setEspessuraCorteMm(data.espessuraCorteMm);
        setRetalhoMinimoMm(data.retalhoMinimoMm);
      })
      .catch(() =>
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as configurações de produção.',
          life: 4000,
        })
      )
      .finally(() => setLoading(false));
  }, [service]);

  const salvar = async () => {
    setSaving(true);
    try {
      const data = await service.salvar({ espessuraCorteMm, retalhoMinimoMm });
      setEspessuraCorteMm(data.espessuraCorteMm);
      setRetalhoMinimoMm(data.retalhoMinimoMm);
      toast.current?.show({ severity: 'success', summary: 'Salvo', detail: 'Configurações de produção atualizadas.', life: 3000 });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error.response?.data?.message || 'Falha ao salvar as configurações.',
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
      <MessageBlock>
        <BlockTitle>Plano de corte</BlockTitle>
        <BlockHint>
          Usados para calcular quantas barras comprar e quais retalhos sobram a partir das peças de cada serviço.
        </BlockHint>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '12px' }}>
          <div>
            <BlockHint>Espessura do corte (disco/serra)</BlockHint>
            <InputNumber
              value={espessuraCorteMm}
              onValueChange={(e) => setEspessuraCorteMm(e.value ?? 0)}
              min={0}
              max={20}
              suffix=" mm"
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
            />
          </div>
          <div>
            <BlockHint>Tamanho mínimo para guardar como retalho (sobras menores contam como sucata)</BlockHint>
            <InputNumber
              value={retalhoMinimoMm / 10}
              onValueChange={(e) => setRetalhoMinimoMm(Math.round((e.value ?? 0) * 10))}
              min={0}
              max={600}
              maxFractionDigits={1}
              locale="pt-BR"
              useGrouping={false}
              suffix=" cm"
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
            />
          </div>
        </div>
      </MessageBlock>
      <SaveButton
        label={saving ? 'Salvando...' : 'Salvar configurações'}
        icon="pi pi-save"
        onClick={salvar}
        disabled={saving}
      />
      <Toast ref={toast} />
    </Section>
  );
};

export default ConfiguracaoProducaoTab;
