# HSA Serralheria – Atualização da Documentação do TCC
## PARTE 1 – Inventário do que mudou (sistema atual × TCC v2)

**Fonte antiga:** `HSA_Serralheria_TCC_v2.odt`  
**Formatação:** `Detalhamento do Modelo de Artigo-2.pdf` (margens A4, TNR, estilos Título/Autor/Resumo etc.)  
**Data desta parte:** 22/09/2026

---

### 1. O que o TCC v2 já cobre bem
- Capítulos 1–4 (empresa, stack Java/Spring/React/PostgreSQL, WhatsApp/WPPConnect, viabilidade)
- Casos de uso e sequências de: login, orçamento, PDF, financeiro, simulação, WhatsApp
- Dicionários: Pessoa, Permissão, Cotacao_Servico, Material_Disponivel, Material_Preco, Conta_Financeira, WhatsApp, Distribuidora

### 2. Gaps principais (precisa atualizar no texto/diagramas)

#### 2.1 Módulos novos (não estavam no escopo documentado)
| Módulo | Rotas / API | Entidades principais |
|--------|-------------|----------------------|
| Ordem de Serviço | `/ordens-servico`, `/api/ordens-servico` | `OrdemServico`, `ItemCorte`, `OrdemServicoMaoDeObra`, enums status/etapa |
| Tipos de serviço (templates) | `/tipos-servico` | `TipoServico`, `TipoServicoItem`, `TipoProduto` |
| Funcionários da oficina | `/funcionarios-oficina` | `FuncionarioOficina` |
| Compra de material/lote | `/compras-lote`, `/compras-lote/nova` | `CompraLote`, `CompraLoteItem`, `StatusCompraLote` |
| Estoque e retalhos | `/estoque` | `EstoqueMaterial`, `MovimentacaoEstoque`, `Retalho`, `TipoMovimentacaoEstoque`, `UnidadeMaterial` |
| Medidas na cotação | criar cotação | campos em `CotacaoServico`: largura/altura/folga, tipoProduto, tipoServico |

#### 2.2 Fluxo de negócio a refletir na documentação
```
Simulação → Orçamento (cotação) → Aprovação do cliente
         ↘ Compra de lote (atalho da simulação) → Estoque
Cotação aprovada → Ordem de Serviço → Corte (retalho/estoque) → Solda/Pintura → Entrega
```

#### 2.3 Classes (Tabela 1 do TCC) – o que incluir/atualizar
**Já na doc:** Pessoa, CotacaoServico, MaterialDisponivel, MaterialPreco, Distribuidora, ContaFinanceira, Simulacao/SimulacaoItem, WhatsApp*, Produto*, Permissão*, Estado/Cidade

**Incluir agora:**
- OrdemServico, OrdemServicoMaoDeObra, ItemCorte, Retalho
- TipoServico, TipoServicoItem
- FuncionarioOficina
- CompraLote, CompraLoteItem
- EstoqueMaterial, MovimentacaoEstoque
- Material (item da cotação com metros/pesoKg)
- Enums documentáveis: StatusOrdemServico, StatusCompraLote, TipoProduto, UnidadeMaterial, EtapaMaoDeObra, TipoMovimentacaoEstoque

**Observação:** `Servico` (legado) existe no código, mas o fluxo real usa `OrdemServico` — na doc preferir OrdemServico.

#### 2.4 Casos de uso / sequências faltando (novas figuras sugeridas)
- UC/Seq: Gerar OS a partir da cotação
- UC/Seq: Gerar lista de corte (barras + retalho + baixa estoque)
- UC/Seq: Lançar mão de obra na OS
- UC/Seq: CRUD Funcionário oficina
- UC/Seq: Cadastro Tipo de Serviço (template + montar materiais por medida)
- UC/Seq: Compra de lote (criar/editar/cancelar com estorno)
- UC/Seq: Gerar compra a partir da simulação
- UC/Seq: Consulta estoque / retalhos
- Atualizar Caso de Uso geral e Diagrama de Classes / DER

#### 2.5 Dicionários de dados faltando (Parte 2)
Prioridade alta:
1. `ordem_servico`
2. `item_corte`
3. `ordem_servico_mao_obra`
4. `funcionario_oficina`
5. `tipo_servico` + `tipo_servico_item`
6. `compra_lote` + `compra_lote_item`
7. `estoque_material`
8. `movimentacao_estoque`
9. `retalho`

Atualizar dicionários existentes:
- `cotacao_servico` (medidas, tipo_produto, id_tipo_servico)
- `material_disponivel` (unidade, comprimento_barra_mm, peso_kg_por_metro)
- `material` (metros, peso_kg)

#### 2.6 Números desatualizados no texto
- Cap. 4.2 cita “23 controllers, 31 services e 27 entidades” → hoje há **45** arquivos em `entity/` (entidades + enums). Contar controllers/services na Parte 2/4 e corrigir.

#### 2.7 Níveis de acesso (Cap. 8)
Incluir na matriz de permissões as telas: Ordens de Serviço, Tipos de Serviço, Funcionários, Compras, Estoque (Gerente/Admin; OS também Funcionário).

---

### 3. Formatação (do PDF “Detalhamento do Modelo”) – lembrar na montagem final
- Papel A4; margens ~ 3,5 cm (esq.) / 3,0 cm (dir./sup./inf. conforme modelo)
- Título: Times New Roman 16 Negrito
- Autor: TNR 12 Ng; endereço TNR 12; e-mail Courier New 10
- Resumo: TNR 12, recuo 0,8 cm D/E, 50–100 palavras
- Seções: TNR 12 Ng (iniciais maiúsculas); 1º parágrafo sem recuo; demais com 1,25 cm; 6 pt antes do parágrafo
- O volume do TCC HSA segue estrutura de monografia (sumário, capítulos 1–9), não o artigo curto do PDF — **aplicar tipografia/margens do modelo**, mantendo a estrutura do ODT atual

---

### 4. Entidades atuais no código (45 arquivos em entity/)
Categoria, Cidade, CobrancaWhatsappHistorico, CompraLote, CompraLoteItem, ConfiguracaoWhatsapp, ContaFinanceira, CotacaoServico, Distribuidora, Estado, EstoqueMaterial, EtapaMaoDeObra, FormaPagamento, FuncionarioOficina, ItemCorte, Marca, Material, MaterialApelido, MaterialDisponivel, MaterialPreco, MovimentacaoEstoque, OrdemServico, OrdemServicoMaoDeObra, OrigemPreco, Permissao, PermissaoPessoa, Pessoa, PrecoMaterialCotacao, Produto, ProdutoImagens, Retalho, Servico, Simulacao, SimulacaoItem, StatusCompraLote, StatusContaFinanceira, StatusOrdemServico, TipoContaFinanceira, TipoDisparoCobranca, TipoMovimentacaoEstoque, TipoProduto, TipoServico, TipoServicoItem, UnidadeMaterial, WhatsappEnvioLog

---

### 5. Próxima entrega (PARTE 2)
Com sua confirmação: redigir os **dicionários de dados** (formato PK / Nome / Tipo / Nulo / A/N / Descrição) das tabelas novas + atualização de Cotacao_Servico e Material_Disponivel.

Arquivos auxiliares gerados:
- `Downloads/HSA_TCC_v2_texto_extraido.md` (texto do ODT antigo)
- `Downloads/detalhamento_completo.txt` (texto do PDF de formatação)
- Este arquivo: `Documentacao_TCC/PARTE1_Inventario.md` (no projeto)
