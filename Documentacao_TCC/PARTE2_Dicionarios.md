# HSA Serralheria – Atualização da Documentação do TCC
## PARTE 2 – Dicionários de Dados (tabelas novas + atualizações)

**Formato:** PK | Nome | Tipo | Nulo | A/N | Descrição (igual ao TCC v2)  
**A/N:** A = alfanumérico (texto), N = numérico/data/boolean/FK  
**Fonte:** Do autor (código JPA em `Backend/.../entity`)

---

### Domínios (enums) usados nas tabelas

| Enum | Valores |
|------|---------|
| StatusOrdemServico | APROVADO, CORTE, SOLDA, PINTURA, INSTALACAO, ENTREGUE, CANCELADO |
| StatusCompraLote | ATIVA, CANCELADA |
| TipoProduto | PORTAO_BASCULANTE, PORTAO_PIVOTANTE, PORTAO_CORRER, PORTAO_SOCIAL, GRADE, CADEIRA, ESTRUTURA, OUTRO |
| EtapaMaoDeObra | CORTE, SOLDA, LIXA, PINTURA, INSTALACAO, OUTRO |
| TipoMovimentacaoEstoque | ENTRADA_COMPRA, ENTRADA_RETALHO, SAIDA_OS, AJUSTE |
| UnidadeMaterial | BARRA, METRO, KG, UNIDADE |
| origem (item_corte) | ESTOQUE, COMPRA, RETALHO, MANUAL |

---

## Tabela A – Dicionário de Dados da Tabela Ordem_Servico

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_cotacao | BIGINT | SIM | N | FK → cotacao_servico (1:1, única) |
| FK | id_tipo_servico | BIGINT | SIM | N | FK → tipo_servico |
| | status | VARCHAR(30) | NÃO | A | Status da OS (enum StatusOrdemServico) |
| | tipo_produto | VARCHAR(40) | SIM | A | Tipo de produto (enum TipoProduto) |
| | nome | VARCHAR(160) | SIM | A | Nome/descrição do serviço |
| | cliente_nome | VARCHAR(160) | SIM | A | Nome do cliente |
| | telefone | VARCHAR(40) | SIM | A | Telefone do cliente |
| | endereco | VARCHAR(300) | SIM | A | Endereço |
| | quantidade_produto | INTEGER | SIM | N | Quantidade de peças/produtos |
| | largura_cm | NUMERIC(10,2) | SIM | N | Largura em cm |
| | altura_cm | NUMERIC(10,2) | SIM | N | Altura em cm |
| | folga_cm | NUMERIC(10,2) | SIM | N | Folga em cm |
| | observacoes | VARCHAR(1000) | SIM | A | Observações gerais |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |
| | data_atualizacao | TIMESTAMP | SIM | N | Data de atualização |

Fonte: Do autor

---

## Tabela B – Dicionário de Dados da Tabela Item_Corte

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_ordem_servico | BIGINT | NÃO | N | FK → ordem_servico |
| FK | id_material_disponivel | BIGINT | NÃO | N | FK → material_disponivel |
| | comprimento_mm | INTEGER | NÃO | N | Comprimento de cada peça (mm) |
| | quantidade | INTEGER | NÃO | N | Quantidade de peças |
| | origem | VARCHAR(30) | SIM | A | ESTOQUE, COMPRA, RETALHO ou MANUAL |
| | barra_indice | INTEGER | SIM | N | Índice da barra no plano de corte |
| | peso_kg | NUMERIC(12,4) | SIM | N | Peso estimado da peça (kg) |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |

Fonte: Do autor

---

## Tabela C – Dicionário de Dados da Tabela Ordem_Servico_Mao_Obra

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_ordem_servico | BIGINT | NÃO | N | FK → ordem_servico |
| FK | id_funcionario | BIGINT | SIM | N | FK → funcionario_oficina |
| | etapa | VARCHAR(30) | NÃO | A | Etapa (enum EtapaMaoDeObra) |
| | horas | NUMERIC(10,2) | NÃO | N | Horas trabalhadas |
| | valor_hora | NUMERIC(12,2) | NÃO | N | Valor cobrado por hora |
| | valor_total | NUMERIC(14,2) | NÃO | N | horas × valor_hora |
| | observacao | VARCHAR(300) | SIM | A | Observação da etapa |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |

Fonte: Do autor

---

## Tabela D – Dicionário de Dados da Tabela Funcionario_Oficina

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| | nome | VARCHAR(120) | NÃO | A | Nome do funcionário |
| | telefone | VARCHAR(30) | SIM | A | Telefone |
| | cargo | VARCHAR(60) | SIM | A | Cargo (ex.: soldador) |
| | valor_hora | NUMERIC(12,2) | NÃO | N | Valor padrão da hora |
| | ativo | BOOLEAN | NÃO | N | Se está ativo no cadastro |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |
| | data_atualizacao | TIMESTAMP | SIM | N | Data de atualização |

Fonte: Do autor

---

## Tabela E – Dicionário de Dados da Tabela Tipo_Servico

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| | nome | VARCHAR(120) | NÃO | A | Nome do template (ex.: Portão basculante) |
| | descricao | VARCHAR(500) | SIM | A | Descrição do tipo |
| | tipo_produto | VARCHAR(40) | SIM | A | Enum TipoProduto associado |
| | ativo | BOOLEAN | NÃO | N | Template disponível para uso |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |
| | data_atualizacao | TIMESTAMP | SIM | N | Data de atualização |

Fonte: Do autor

---

## Tabela F – Dicionário de Dados da Tabela Tipo_Servico_Item

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_tipo_servico | BIGINT | NÃO | N | FK → tipo_servico |
| FK | id_material_disponivel | BIGINT | NÃO | N | FK → material_disponivel |
| | metros_por_metro_largura | NUMERIC(12,4) | SIM | N | Metros de material por metro de largura |
| | metros_por_metro_altura | NUMERIC(12,4) | SIM | N | Metros de material por metro de altura |
| | quantidade_fixa | NUMERIC(12,4) | SIM | N | Quantidade fixa por unidade do serviço |
| | observacao | VARCHAR(200) | SIM | A | Observação do item |

Fonte: Do autor

---

## Tabela G – Dicionário de Dados da Tabela Compra_Lote

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_distribuidora | BIGINT | SIM | N | FK → distribuidora |
| | data_compra | DATE | NÃO | N | Data da compra |
| | numero_nota | VARCHAR(60) | SIM | A | Número da nota fiscal |
| | observacao | VARCHAR(500) | SIM | A | Observação da compra |
| | status | VARCHAR(20) | NÃO | A | ATIVA ou CANCELADA |
| | motivo_cancelamento | VARCHAR(500) | SIM | A | Motivo ao cancelar |
| | data_cancelamento | TIMESTAMP | SIM | N | Quando foi cancelada |
| | valor_total | NUMERIC(14,2) | SIM | N | Soma dos itens |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |

Fonte: Do autor

---

## Tabela H – Dicionário de Dados da Tabela Compra_Lote_Item

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_compra_lote | BIGINT | NÃO | N | FK → compra_lote |
| FK | id_material_disponivel | BIGINT | NÃO | N | FK → material_disponivel |
| | quantidade_kg | NUMERIC(14,4) | SIM | N | Peso comprado (kg) |
| | metros | NUMERIC(14,4) | SIM | N | Metros lineares |
| | barras | INTEGER | SIM | N | Quantidade de barras |
| | valor_kg | NUMERIC(14,4) | SIM | N | Preço por kg |
| | valor_total | NUMERIC(14,2) | SIM | N | Valor do item |

Fonte: Do autor

---

## Tabela I – Dicionário de Dados da Tabela Estoque_Material

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_material_disponivel | BIGINT | NÃO | N | FK → material_disponivel (1:1, única) |
| | quantidade_kg | NUMERIC(14,4) | NÃO | N | Saldo em kg |
| | metros | NUMERIC(14,4) | NÃO | N | Saldo em metros |
| | barras | INTEGER | NÃO | N | Saldo em barras |
| | data_atualizacao | TIMESTAMP | SIM | N | Última atualização do saldo |

Fonte: Do autor

---

## Tabela J – Dicionário de Dados da Tabela Movimentacao_Estoque

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_material_disponivel | BIGINT | NÃO | N | FK → material_disponivel |
| | tipo | VARCHAR(30) | NÃO | A | Enum TipoMovimentacaoEstoque |
| | quantidade_kg | NUMERIC(14,4) | SIM | N | Quantidade movimentada (kg) |
| | metros | NUMERIC(14,4) | SIM | N | Metros movimentados |
| | barras | INTEGER | SIM | N | Barras movimentadas |
| | referencia | VARCHAR(300) | SIM | A | Origem (ex.: OS #id, compra #id) |
| | data_movimentacao | TIMESTAMP | NÃO | N | Data/hora da movimentação |

Fonte: Do autor

---

## Tabela K – Dicionário de Dados da Tabela Retalho

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_material_disponivel | BIGINT | NÃO | N | FK → material_disponivel |
| FK | id_ordem_origem | BIGINT | SIM | N | FK → ordem_servico que gerou o retalho |
| | comprimento_mm | INTEGER | NÃO | N | Comprimento do retalho (mm) |
| | peso_kg | NUMERIC(12,4) | SIM | N | Peso do retalho |
| | disponivel | BOOLEAN | NÃO | N | Se ainda pode ser reutilizado |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |

Fonte: Do autor

---

## Atualizações de tabelas já existentes no TCC

### Cotacao_Servico – campos a **acrescentar** na Tabela 6

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| | tipo_produto | VARCHAR(40) | SIM | A | Enum TipoProduto |
| FK | id_tipo_servico | BIGINT | SIM | N | FK → tipo_servico (template) |
| | largura_cm | NUMERIC(10,2) | SIM | N | Largura informada na cotação |
| | altura_cm | NUMERIC(10,2) | SIM | N | Altura informada na cotação |
| | folga_cm | NUMERIC(10,2) | SIM | N | Folga (cm) |
| | preco_unitario | DOUBLE | SIM | N | Preço unitário (legado/auxiliar) |

*(Demais campos da Tabela 6 do TCC v2 permanecem.)*

### Material_Disponivel – **substituir** campos desatualizados da Tabela 7

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| | descricao | VARCHAR | SIM | A | Descrição do material |
| | tamanho | NUMERIC(12,4) | SIM | N | Tamanho de referência |
| | unidade | VARCHAR(20) | SIM | A | BARRA, METRO, KG ou UNIDADE |
| | comprimento_barra_mm | INTEGER | SIM | N | Comprimento padrão da barra (ex.: 6000) |
| | peso_kg_por_metro | NUMERIC(12,4) | SIM | N | Peso linear (kg/m) |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |
| | data_atualizacao | TIMESTAMP | SIM | N | Data de atualização |

**Remover da doc antiga:** `unidade_medida`, `tamanho_comercial`, `estoque` (estoque passou para `estoque_material`).

### Material (item da cotação) – campos a documentar / atualizar

| PK/FK | Nome | Tipo | Nulo | A/N | Descrição |
|-------|------|------|------|-----|-----------|
| PK | id | BIGINT | NÃO | N | Identificador único |
| FK | id_material_disponivel | BIGINT | SIM | N | FK → material_disponivel |
| FK | id_cotacao | BIGINT | SIM | N | FK → cotacao_servico |
| | quantidade | INTEGER | SIM | N | Quantidade (unidades/barras) |
| | metros | NUMERIC(12,4) | SIM | N | Metros lineares necessários |
| | peso_kg | NUMERIC(12,4) | SIM | N | Peso estimado (kg) |
| | data_criacao | TIMESTAMP | SIM | N | Data de criação |
| | data_atualizacao | TIMESTAMP | SIM | N | Data de atualização |

---

### Relacionamentos principais (para DER – Parte 3)

```
cotacao_servico 1──1 ordem_servico
tipo_servico 1──* tipo_servico_item *──1 material_disponivel
ordem_servico 1──* item_corte *──1 material_disponivel
ordem_servico 1──* ordem_servico_mao_obra *──1 funcionario_oficina
compra_lote 1──* compra_lote_item *──1 material_disponivel
material_disponivel 1──1 estoque_material
material_disponivel 1──* movimentacao_estoque
material_disponivel 1──* retalho
ordem_servico 1──* retalho (ordem_origem)
```

---

### Numeração sugerida no TCC (após Tabelas 3–12 atuais)

| Nº sugerido | Tabela |
|-------------|--------|
| 13 | Ordem_Servico |
| 14 | Item_Corte |
| 15 | Ordem_Servico_Mao_Obra |
| 16 | Funcionario_Oficina |
| 17 | Tipo_Servico |
| 18 | Tipo_Servico_Item |
| 19 | Compra_Lote |
| 20 | Compra_Lote_Item |
| 21 | Estoque_Material |
| 22 | Movimentacao_Estoque |
| 23 | Retalho |
| — | Atualizar Tabelas 6 e 7 (+ Material se houver) |

---

### Próxima entrega (PARTE 3)
Textos para: Lista de Classes atualizada, novos Casos de Uso e roteiros das Sequências (OS, corte, compra, estoque, funcionários, tipos). Diagramas (PlantUML/Mermaid ou descrição para você desenhar no Astah/Draw.io).
