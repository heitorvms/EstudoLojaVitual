# HSA Serralheria – Revarredura do código (27/09/2026)
## O que mudou desde o `HSA_Serralheria_Volume_Atualizado.pdf` e o que alterar no TCC

---

## 1. Resumo das mudanças no sistema

| Área | Antes (no volume gerado) | Agora (código) |
|------|--------------------------|----------------|
| Tipo de serviço (template) | `TipoServico` / `TipoServicoItem`, página `/tipos-servico` | **Removido**. Substituído por **modelos padronizados** dentro da Simulação (`simulacao.padronizado`) |
| Medidas na cotação | largura/altura/folga, `tipo_produto`, `id_tipo_servico` | **Removido** (schema.sql faz `DROP COLUMN`) |
| Lista de corte / retalho | `ItemCorte`, `Retalho`, `ENTRADA_RETALHO` | **Removido** (`DROP TABLE item_corte`, `retalho`) |
| Status da OS | APROVADO, CORTE, SOLDA, PINTURA, INSTALACAO, ENTREGUE, CANCELADO | **ABERTO, EM_PRODUCAO, CONCLUIDO, CANCELADO** |
| Baixa de estoque | pelo plano de corte | **Automática** quando a OS passa a EM_PRODUCAO/CONCLUIDO (flag `estoque_baixado`); **devolução opcional** ao cancelar |
| Criação da OS | botão gera direto | Tela de **rascunho** (`/ordens-servico/nova/:cotacaoId`) → confirma → cria OS + **gera financeiro** |
| Mão de obra | por **etapa** (corte/solda…) | Por **data de trabalho**, turno **diurno/noturno**, controle de **pago ao funcionário** |
| Funcionário da oficina | valor/hora | + **valor/hora noturno**, **resumo por período**, **pagamento de lançamentos**, **desativação** quando há histórico |
| Financeiro | contas geradas ao salvar a cotação, sem categoria | Contas geradas **a partir da OS**, com **categoria** (MATERIAL, MAO_DE_OBRA, INSUMOS, FRETE): a receber (material e MO, parcelável até 24x) e a pagar (materiais, insumos, frete); quitação/estorno por categoria na OS; cancelamento da OS cancela contas em aberto |
| Simulação | cálculo + atalho “gerar compra” | Cálculo + **modelos padronizados** + **gerar orçamento** a partir da simulação (vai para Criar Cotação pré-preenchido). O atalho para compra **não existe mais** |
| Configurações | páginas separadas de usuários/permissões | Página única com abas **Usuários e Permissões** e **WhatsApp** |
| Enum movimentação | ENTRADA_COMPRA, ENTRADA_RETALHO, SAIDA_OS, AJUSTE | **ENTRADA_COMPRA, SAIDA_OS, AJUSTE** |

---

## 2. Números para corrigir no texto (Caps. 3.3, 4.2, 9)

| Item | No volume | Real agora |
|------|-----------|-----------|
| Controllers | 27 | **26** |
| Services | 37 | **36** |
| Repositories | 32 | **29** |
| Pacote entity | 45 | **40** (30 entidades + 10 enums) |
| DTOs | — | 44 |
| Páginas React | 21 | **20** |
| Services frontend | 21 | **19** (+ `BaseService`) |

Tabelas no banco: 30 tabelas de entidade + associativas (`cotacao_distribuidora`, `servico_material`, `servico_distribuidora`).

---

## 3. Figuras – o que fazer

| Figura | Situação | Ação |
|--------|----------|------|
| 1 – Organograma | Sem mudança | Manter |
| 2 – Caso de Uso | Tem “Tipo serviço”, “Lista de corte” | **Refazer**: remover esses; incluir “Modelo padronizado”, “Gerar orçamento da simulação”, “Pagar mão de obra”, “Gerar financeiro da OS”, “Cancelar OS (devolver estoque)” |
| 3 – Classes | Tem TipoServico, ItemCorte, Retalho | **Refazer** com o modelo atual (seção 5) |
| 4 – Login | OK | Manter |
| 5 – Cadastro de Orçamento | Antigo gerava contas ao salvar | **Refazer**: cotação não gera mais financeiro; pode vir da simulação |
| 6 – PDF | OK | Manter |
| 7 – “Cadastro de Funcionário” | Refere-se a usuário (Pessoa) | **Renomear** para “Cadastro de Usuário” (evita confusão com Funcionário da oficina) |
| 8 – Relatórios | OK | Manter |
| 9 – Permissões | Agora dentro de Configurações | **Ajustar** tela de origem |
| 10–13 – CRUD genérico | OK | Manter |
| 14 – WhatsApp orçamento | OK | Manter |
| 15 – Módulo Financeiro | Fluxo antigo | **Refazer**: geração pela OS com categorias, parcelas, quitação/estorno, cobrança WhatsApp |
| 16 – Simulação | Fluxo antigo | **Refazer**: calcular, salvar histórico, modelo padronizado, gerar orçamento |
| 17 – Conexão WPPConnect | OK | Manter |
| 18 – Deploy / 19 – Componentes | Faltam módulos OS/Estoque/Compra | **Atualizar** componentes |
| 20 – DER | Tem tabelas removidas | **Refazer** (seção 5) |
| 21 – Arquitetural | Faltam módulos novos | **Atualizar** |
| 22 – Gerar OS | Fluxo antigo | **Refazer**: rascunho → confirmar → OS + financeiro |
| 23 – Lista de corte | Removido | **Substituir** por “Alterar status da OS / baixa automática de estoque” |
| 24 – Mão de obra | Tinha etapa | **Refazer**: data, turno, valor noturno |
| 25 – Compra de lote | OK | Manter |
| 26 – Cancelar compra | OK | Manter |
| 27 – Compra a partir da simulação | Removido | **Substituir** por “Gerar orçamento a partir da simulação” |
| 28 – Tipo de serviço + medidas | Removido | **Substituir** por “Pagamento de mão de obra ao funcionário” |
| **Novas** | — | “Cancelar OS (contas + devolução de estoque)” e “Quitar/estornar recebimento pela OS” |

---

## 4. Tabelas (dicionários) – o que fazer

### 4.1 Remover
- Item_Corte, Retalho, Tipo_Servico, Tipo_Servico_Item.
- Campos `tipo_produto`, `id_tipo_servico`, `largura_cm`, `altura_cm`, `folga_cm` de Cotacao_Servico e Ordem_Servico.

### 4.2 Alterar
**Ordem_Servico** (atual):
id (PK), id_cotacao (FK único), status VARCHAR(30) [ABERTO/EM_PRODUCAO/CONCLUIDO/CANCELADO], estoque_baixado BOOLEAN, nome VARCHAR(160), cliente_nome VARCHAR(160), telefone VARCHAR(40), endereco VARCHAR(300), quantidade_produto INTEGER, observacoes VARCHAR(1000), data_criacao, data_atualizacao.

**Ordem_Servico_Mao_Obra** (atual):
id, id_ordem_servico (FK), id_funcionario (FK), noturno BOOLEAN, horas NUMERIC(10,2), valor_hora NUMERIC(12,2), valor_total NUMERIC(14,2), observacao VARCHAR(300), data_trabalho DATE, pago_funcionario BOOLEAN, data_pagamento_funcionario DATE, data_criacao. **Sem** `etapa`.

**Funcionario_Oficina**: acrescentar `valor_hora_noturno NUMERIC(12,2)`.

**Conta_Financeira** (a do volume estava incompleta):
id, tipo VARCHAR(20) [PAGAR/RECEBER], status VARCHAR(20) [PENDENTE/PARCIAL/PAGA/VENCIDA/CANCELADA], categoria VARCHAR(20) [MATERIAL/MAO_DE_OBRA/INSUMOS/FRETE], forma_pagamento VARCHAR(30), valor NUMERIC(14,2), valor_pago NUMERIC(14,2), descricao VARCHAR(500), cliente_nome_snapshot VARCHAR(200), telefone_cliente_snapshot VARCHAR(50), data_vencimento DATE, data_pagamento TIMESTAMP, id_cotacao (FK), id_distribuidora (FK), numero_parcela INTEGER, total_parcelas INTEGER, grupo_parcela VARCHAR(36), data_criacao, data_atualizacao.

**Simulacao**: acrescentar `padronizado BOOLEAN`, `percentual_insumos`, `valor_frete`, `total_custo_materiais`, `valor_insumos`.

**Movimentacao_Estoque**: domínio `tipo` = ENTRADA_COMPRA, SAIDA_OS, AJUSTE.

### 4.3 Corrigir (estavam errados no volume gerado)
| Tabela | Correção |
|--------|----------|
| Distribuidora | Só tem `id`, `nome`, `data_criacao`, `data_atualizacao` (não tem telefone/e-mail) |
| Configuracao_Whatsapp | `mensagem_orcamento` TEXT, `mensagem_cobranca` TEXT, `url_wppconnect` VARCHAR(255), `token_wppconnect` TEXT, `nome_sessao` VARCHAR(100) |
| Whatsapp_Envio_Log | `cotacao_id` (FK), `status` VARCHAR(20), `telefone_destino` VARCHAR(20), `mensagem_enviada` TEXT, `data_envio` TIMESTAMP, `erro_detalhe` TEXT |
| Material_Preco | `id_material_disponivel`, `id_distribuidora`, `preco_unitario` NUMERIC(12,2), `prazo_entrega_dias` INTEGER, `observacao` VARCHAR(255), `origem` [MANUAL/COTACAO/IMPORTACAO], `data_inicio`, `data_fim` |
| Pessoa | Faltam `endereco`, `cep`, `codigo_recuperacao_senha`, `data_envia_codigo`, `data_atualizacao`; FK é `idCidade` |
| Permissao_Pessoa | FKs `idPessoa`, `idPermissao` |

### 4.4 Acrescentar (não havia dicionário)
- **Simulacao** e **Simulacao_Item** (consumo_por_unidade, consumo_total, total_com_perda, quantidade_barras, sobra_estimada, preco_unitario_snapshot, distribuidora_nome_snapshot, custo_estimado)
- **Cobranca_Whatsapp_Historico** (id_conta, mensagem, telefone, link_whatsapp, tipo [PREVIEW/ABERTURA_WHATSAPP/LOTE_VENCIDAS], data_disparo)
- **Material_Apelido** (usado na importação de planilhas)
- **Preco_Material_Cotacao**
- Opcional: Estado, Cidade

### 4.5 Nova ordem sugerida das tabelas
3 Pessoa · 4 Permissao · 5 Permissao_Pessoa · 6 Cotacao_Servico · 7 Material · 8 Material_Disponivel · 9 Material_Preco · 10 Distribuidora · 11 Simulacao · 12 Simulacao_Item · 13 Ordem_Servico · 14 Ordem_Servico_Mao_Obra · 15 Funcionario_Oficina · 16 Conta_Financeira · 17 Cobranca_Whatsapp_Historico · 18 Compra_Lote · 19 Compra_Lote_Item · 20 Estoque_Material · 21 Movimentacao_Estoque · 22 Configuracao_Whatsapp · 23 Whatsapp_Envio_Log · 24 Matriz de acesso

Tabela 1 (classes): remover TipoServico/TipoServicoItem, ItemCorte, Retalho; acrescentar Simulacao (modelo padronizado), CobrancaWhatsappHistorico, MaterialApelido.

---

## 5. Relacionamentos para o DER / Classes (versão atual)

```
pessoa N──1 cidade N──1 estado
pessoa 1──N permissao_pessoa N──1 permissao
cotacao_servico N──1 pessoa (cliente, opcional)
cotacao_servico 1──N material N──1 material_disponivel
cotacao_servico N──N distribuidora (cotacao_distribuidora)
cotacao_servico 1──N preco_material_cotacao
cotacao_servico 1──1 ordem_servico
cotacao_servico 1──N conta_financeira N──1 distribuidora
conta_financeira 1──N cobranca_whatsapp_historico
cotacao_servico 1──N whatsapp_envio_log
ordem_servico 1──N ordem_servico_mao_obra N──1 funcionario_oficina
material_disponivel 1──N material_preco N──1 distribuidora
material_disponivel 1──N material_apelido N──1 distribuidora
material_disponivel 1──1 estoque_material
material_disponivel 1──N movimentacao_estoque
compra_lote N──1 distribuidora; compra_lote 1──N compra_lote_item N──1 material_disponivel
simulacao 1──N simulacao_item N──1 material_disponivel
```

---

## 6. Textos a revisar

| Local | Ajuste |
|-------|--------|
| Título | Tirar a ênfase em corte/medidas; “Orçamentos, Ordens de Serviço e Gestão de Estoque” continua válido |
| Resumo/Abstract | Remover “medidas e templates de tipos de serviço”, “lista de corte”, “retalhos”; incluir “modelos padronizados de simulação”, “mão de obra diurna/noturna com controle de pagamento”, “financeiro por categoria gerado pela OS” |
| 2.4.2 | Trocar “tipos de serviço” e “retalhos” por “modelos padronizados” e “pagamento de funcionários” |
| 3.1 / 3.2 | Mesmos ajustes; remover “lista de corte” e “compra a partir da simulação” |
| 3.3 | Números da seção 2; incluir Apache POI (importação de planilhas), Lombok, jjwt 0.12.6, Freemarker (e-mail) |
| 5.x (texto das sequências) | Reescrever a narrativa das figuras 22–28 conforme a seção 3 |
| 8.1 Níveis de acesso | Remover “Tipos de serviço”. **Conferir**: rota `/configuracoes` (com Usuários e Permissões) está liberada para **Gerente** e Admin, e `/api/pessoa/**` aceita Gerente. O texto antigo dizia que o Gerente não gerencia usuários, o que não bate com o código |
| 9 Conclusão | Números novos; remover corte/retalho/templates |
| “Catálogo de produtos” | Backend tem Produto/Categoria/Marca, mas **não há tela** no frontend. Remover do resumo ou citar como módulo apenas de API |
| Capa/folha de rosto | **Conferir** orientador e ano: o volume 26-10 traz “Prof. Me. Jaime William Dias / 2025”; o v2 traz “Prof. Esp. Ricardo Ribeiro Rufino / 2026” |

---

## 7. Referências – problemas e sugestões

**Problemas na lista atual**
1. “Acesso em: 2026” está incompleto; a ABNT (NBR 6023) pede dia, mês abreviado e ano (ex.: “Acesso em: 27 set. 2026”).
2. A referência do JWT aponta para a página da MDN sobre autenticação HTTP, não para o JWT. Trocar pela RFC 7519.
3. A LGPD é citada no texto (4.3), mas não aparece nas referências.
4. Os CNAEs são citados (2.1.2) sem fonte (IBGE/CONCLA).
5. BOOCH et al., *UML – Guia do Usuário*, 2ª ed.: conferir o ano da edição brasileira (a da Campus/Elsevier costuma ser citada como 2006, não 2005).
6. Tecnologias usadas no sistema que não estão referenciadas: PrimeReact, Material UI, Tailwind CSS, Axios, Chart.js, Apache POI, Lombok, Hibernate, Maven, Docker (usado para subir o WPPConnect).

**Referências sugeridas para acrescentar** (conferir datas de acesso)
- BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018.
- IBGE. Comissão Nacional de Classificação (CONCLA). CNAE 2.3. Disponível em: https://concla.ibge.gov.br/.
- JONES, M.; BRADLEY, J.; SAKIMURA, N. RFC 7519: JSON Web Token (JWT). IETF, 2015. Disponível em: https://www.rfc-editor.org/rfc/rfc7519.
- APACHE SOFTWARE FOUNDATION. Apache POI. Disponível em: https://poi.apache.org/.
- APACHE SOFTWARE FOUNDATION. Apache Maven. Disponível em: https://maven.apache.org/.
- HIBERNATE. Hibernate ORM Documentation. Disponível em: https://hibernate.org/orm/documentation/.
- PRIMETEK. PrimeReact. Disponível em: https://primereact.org/.
- MUI. Material UI. Disponível em: https://mui.com/material-ui/.
- TAILWIND LABS. Tailwind CSS. Disponível em: https://tailwindcss.com/.
- AXIOS. Axios Documentation. Disponível em: https://axios-http.com/.
- CHART.JS. Chart.js Documentation. Disponível em: https://www.chartjs.org/.
- PROJECT LOMBOK. Disponível em: https://projectlombok.org/.
- DOCKER INC. Docker Documentation. Disponível em: https://docs.docker.com/.
- SPRING.IO. Spring Security Reference. Disponível em: https://docs.spring.io/spring-security/reference/.

---

## 8. Próximo passo
Regenerar o volume (`gerar_volume_completo.py`) com:
1. Diagramas refeitos: 2, 3, 5, 15, 16, 20, 22–28 (+2 novos).
2. Dicionários corrigidos/reordenados (seção 4).
3. Textos da seção 6 e referências da seção 7.
4. Pendências que só você confirma: orientador/ano da capa, Gerente pode ou não gerenciar usuários, e se “catálogo de produtos” fica no texto.
