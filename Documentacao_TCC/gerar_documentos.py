# -*- coding: utf-8 -*-
"""Gera ODT e PDF consolidados da atualização do TCC HSA."""
from pathlib import Path

from odf.opendocument import OpenDocumentText
from odf.style import Style, TextProperties, ParagraphProperties, FontFace
from odf.text import P, H, Span, List, ListItem
from odf.table import Table, TableColumn, TableRow, TableCell
from odf import teletype

from fpdf import FPDF

OUT = Path(__file__).resolve().parent


# ---------- conteúdo estruturado ----------

def sections():
    return [
        ("title", "HSA Serralheria — Atualização da Documentação do TCC"),
        ("subtitle", "Textos, dicionários, classes, casos de uso e sequências\n(para colar no ODT acadêmico — set/2026)"),
        ("h1", "PARTE 1 — Inventário do que mudou"),
        ("p", "Fonte antiga: HSA_Serralheria_TCC_v2.odt. Formatação: Detalhamento do Modelo de Artigo (margens A4, Times New Roman)."),
        ("h2", "1. O que o TCC v2 já cobre bem"),
        ("bullets", [
            "Capítulos 1–4 (empresa, stack Java/Spring/React/PostgreSQL, WhatsApp/WPPConnect, viabilidade)",
            "Casos de uso e sequências: login, orçamento, PDF, financeiro, simulação, WhatsApp",
            "Dicionários: Pessoa, Permissão, Cotacao_Servico, Material_Disponivel, Material_Preco, Conta_Financeira, WhatsApp, Distribuidora",
        ]),
        ("h2", "2. Gaps principais"),
        ("p", "Módulos novos a documentar: Ordem de Serviço; Tipos de serviço (templates); Funcionários da oficina; Compra de material/lote; Estoque e retalhos; Medidas na cotação (largura/altura/folga, tipoProduto, tipoServico)."),
        ("h2", "3. Fluxo de negócio"),
        ("p", "Simulação → Orçamento (cotação) → Aprovação do cliente. Atalho: Simulação → Compra de lote → Estoque. Cotação aprovada → Ordem de Serviço → Corte (retalho/estoque) → Solda/Pintura → Entrega."),
        ("h2", "4. Contagens atuais no código"),
        ("p", "27 controllers, 37 services, 32 repositories, 45 arquivos em entity/, 21 páginas React, 21 services frontend."),
        ("h1", "PARTE 2 — Dicionários de Dados"),
        ("p", "Formato: PK/FK | Nome | Tipo | Nulo | A/N | Descrição. Fonte: entidades JPA."),
        ("h2", "Domínios (enums)"),
        ("bullets", [
            "StatusOrdemServico: APROVADO, CORTE, SOLDA, PINTURA, INSTALACAO, ENTREGUE, CANCELADO",
            "StatusCompraLote: ATIVA, CANCELADA",
            "TipoProduto: PORTAO_BASCULANTE, PORTAO_PIVOTANTE, PORTAO_CORRER, PORTAO_SOCIAL, GRADE, CADEIRA, ESTRUTURA, OUTRO",
            "EtapaMaoDeObra: CORTE, SOLDA, LIXA, PINTURA, INSTALACAO, OUTRO",
            "TipoMovimentacaoEstoque: ENTRADA_COMPRA, ENTRADA_RETALHO, SAIDA_OS, AJUSTE",
            "UnidadeMaterial: BARRA, METRO, KG, UNIDADE",
            "origem (item_corte): ESTOQUE, COMPRA, RETALHO, MANUAL",
        ]),
        ("h2", "Tabela 13 — Ordem_Servico"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador único"],
            ["FK", "id_cotacao", "BIGINT", "SIM", "N", "FK → cotacao_servico (1:1)"],
            ["FK", "id_tipo_servico", "BIGINT", "SIM", "N", "FK → tipo_servico"],
            ["", "status", "VARCHAR(30)", "NÃO", "A", "StatusOrdemServico"],
            ["", "tipo_produto", "VARCHAR(40)", "SIM", "A", "TipoProduto"],
            ["", "nome", "VARCHAR(160)", "SIM", "A", "Nome do serviço"],
            ["", "cliente_nome", "VARCHAR(160)", "SIM", "A", "Nome do cliente"],
            ["", "telefone", "VARCHAR(40)", "SIM", "A", "Telefone"],
            ["", "endereco", "VARCHAR(300)", "SIM", "A", "Endereço"],
            ["", "quantidade_produto", "INTEGER", "SIM", "N", "Quantidade"],
            ["", "largura_cm", "NUMERIC(10,2)", "SIM", "N", "Largura cm"],
            ["", "altura_cm", "NUMERIC(10,2)", "SIM", "N", "Altura cm"],
            ["", "folga_cm", "NUMERIC(10,2)", "SIM", "N", "Folga cm"],
            ["", "observacoes", "VARCHAR(1000)", "SIM", "A", "Observações"],
            ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Criação"],
            ["", "data_atualizacao", "TIMESTAMP", "SIM", "N", "Atualização"],
        ]),
        ("h2", "Tabela 14 — Item_Corte"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["FK", "id_ordem_servico", "BIGINT", "NÃO", "N", "FK → ordem_servico"],
            ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "FK → material_disponivel"],
            ["", "comprimento_mm", "INTEGER", "NÃO", "N", "Comprimento peça mm"],
            ["", "quantidade", "INTEGER", "NÃO", "N", "Qtd peças"],
            ["", "origem", "VARCHAR(30)", "SIM", "A", "ESTOQUE/COMPRA/RETALHO/MANUAL"],
            ["", "barra_indice", "INTEGER", "SIM", "N", "Índice da barra"],
            ["", "peso_kg", "NUMERIC(12,4)", "SIM", "N", "Peso kg"],
            ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Criação"],
        ]),
        ("h2", "Tabela 15 — Ordem_Servico_Mao_Obra"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["FK", "id_ordem_servico", "BIGINT", "NÃO", "N", "FK → ordem_servico"],
            ["FK", "id_funcionario", "BIGINT", "SIM", "N", "FK → funcionario_oficina"],
            ["", "etapa", "VARCHAR(30)", "NÃO", "A", "EtapaMaoDeObra"],
            ["", "horas", "NUMERIC(10,2)", "NÃO", "N", "Horas"],
            ["", "valor_hora", "NUMERIC(12,2)", "NÃO", "N", "Valor/hora"],
            ["", "valor_total", "NUMERIC(14,2)", "NÃO", "N", "horas × valor_hora"],
            ["", "observacao", "VARCHAR(300)", "SIM", "A", "Observação"],
            ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Criação"],
        ]),
        ("h2", "Tabela 16 — Funcionario_Oficina"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["", "nome", "VARCHAR(120)", "NÃO", "A", "Nome"],
            ["", "telefone", "VARCHAR(30)", "SIM", "A", "Telefone"],
            ["", "cargo", "VARCHAR(60)", "SIM", "A", "Cargo"],
            ["", "valor_hora", "NUMERIC(12,2)", "NÃO", "N", "Valor hora"],
            ["", "ativo", "BOOLEAN", "NÃO", "N", "Ativo"],
            ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Criação"],
            ["", "data_atualizacao", "TIMESTAMP", "SIM", "N", "Atualização"],
        ]),
        ("h2", "Tabela 17 — Tipo_Servico"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["", "nome", "VARCHAR(120)", "NÃO", "A", "Nome do template"],
            ["", "descricao", "VARCHAR(500)", "SIM", "A", "Descrição"],
            ["", "tipo_produto", "VARCHAR(40)", "SIM", "A", "TipoProduto"],
            ["", "ativo", "BOOLEAN", "NÃO", "N", "Disponível"],
            ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Criação"],
            ["", "data_atualizacao", "TIMESTAMP", "SIM", "N", "Atualização"],
        ]),
        ("h2", "Tabela 18 — Tipo_Servico_Item"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["FK", "id_tipo_servico", "BIGINT", "NÃO", "N", "FK → tipo_servico"],
            ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "FK → material_disponivel"],
            ["", "metros_por_metro_largura", "NUMERIC(12,4)", "SIM", "N", "Fator largura"],
            ["", "metros_por_metro_altura", "NUMERIC(12,4)", "SIM", "N", "Fator altura"],
            ["", "quantidade_fixa", "NUMERIC(12,4)", "SIM", "N", "Qtd fixa"],
            ["", "observacao", "VARCHAR(200)", "SIM", "A", "Observação"],
        ]),
        ("h2", "Tabela 19 — Compra_Lote"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["FK", "id_distribuidora", "BIGINT", "SIM", "N", "FK → distribuidora"],
            ["", "data_compra", "DATE", "NÃO", "N", "Data compra"],
            ["", "numero_nota", "VARCHAR(60)", "SIM", "A", "Nº NF"],
            ["", "observacao", "VARCHAR(500)", "SIM", "A", "Observação"],
            ["", "status", "VARCHAR(20)", "NÃO", "A", "ATIVA/CANCELADA"],
            ["", "motivo_cancelamento", "VARCHAR(500)", "SIM", "A", "Motivo"],
            ["", "data_cancelamento", "TIMESTAMP", "SIM", "N", "Cancelamento"],
            ["", "valor_total", "NUMERIC(14,2)", "SIM", "N", "Total"],
            ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Criação"],
        ]),
        ("h2", "Tabela 20 — Compra_Lote_Item"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["FK", "id_compra_lote", "BIGINT", "NÃO", "N", "FK → compra_lote"],
            ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "FK → material_disponivel"],
            ["", "quantidade_kg", "NUMERIC(14,4)", "SIM", "N", "Kg"],
            ["", "metros", "NUMERIC(14,4)", "SIM", "N", "Metros"],
            ["", "barras", "INTEGER", "SIM", "N", "Barras"],
            ["", "valor_kg", "NUMERIC(14,4)", "SIM", "N", "Preço/kg"],
            ["", "valor_total", "NUMERIC(14,2)", "SIM", "N", "Total item"],
        ]),
        ("h2", "Tabela 21 — Estoque_Material"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "FK 1:1 material_disponivel"],
            ["", "quantidade_kg", "NUMERIC(14,4)", "NÃO", "N", "Saldo kg"],
            ["", "metros", "NUMERIC(14,4)", "NÃO", "N", "Saldo metros"],
            ["", "barras", "INTEGER", "NÃO", "N", "Saldo barras"],
            ["", "data_atualizacao", "TIMESTAMP", "SIM", "N", "Atualização"],
        ]),
        ("h2", "Tabela 22 — Movimentacao_Estoque"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "FK → material_disponivel"],
            ["", "tipo", "VARCHAR(30)", "NÃO", "A", "TipoMovimentacaoEstoque"],
            ["", "quantidade_kg", "NUMERIC(14,4)", "SIM", "N", "Kg"],
            ["", "metros", "NUMERIC(14,4)", "SIM", "N", "Metros"],
            ["", "barras", "INTEGER", "SIM", "N", "Barras"],
            ["", "referencia", "VARCHAR(300)", "SIM", "A", "OS/compra etc."],
            ["", "data_movimentacao", "TIMESTAMP", "NÃO", "N", "Data/hora"],
        ]),
        ("h2", "Tabela 23 — Retalho"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "FK → material_disponivel"],
            ["FK", "id_ordem_origem", "BIGINT", "SIM", "N", "FK → ordem_servico"],
            ["", "comprimento_mm", "INTEGER", "NÃO", "N", "Comprimento mm"],
            ["", "peso_kg", "NUMERIC(12,4)", "SIM", "N", "Peso kg"],
            ["", "disponivel", "BOOLEAN", "NÃO", "N", "Reutilizável"],
            ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Criação"],
        ]),
        ("h2", "Atualizações — Cotacao_Servico (acrescentar)"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["", "tipo_produto", "VARCHAR(40)", "SIM", "A", "TipoProduto"],
            ["FK", "id_tipo_servico", "BIGINT", "SIM", "N", "FK → tipo_servico"],
            ["", "largura_cm", "NUMERIC(10,2)", "SIM", "N", "Largura"],
            ["", "altura_cm", "NUMERIC(10,2)", "SIM", "N", "Altura"],
            ["", "folga_cm", "NUMERIC(10,2)", "SIM", "N", "Folga"],
        ]),
        ("h2", "Atualizações — Material_Disponivel (substituir campos antigos)"),
        ("table", [
            ["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"],
            ["PK", "id", "BIGINT", "NÃO", "N", "Identificador"],
            ["", "descricao", "VARCHAR", "SIM", "A", "Descrição"],
            ["", "tamanho", "NUMERIC(12,4)", "SIM", "N", "Tamanho ref."],
            ["", "unidade", "VARCHAR(20)", "SIM", "A", "BARRA/METRO/KG/UNIDADE"],
            ["", "comprimento_barra_mm", "INTEGER", "SIM", "N", "Ex.: 6000"],
            ["", "peso_kg_por_metro", "NUMERIC(12,4)", "SIM", "N", "kg/m"],
            ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Criação"],
            ["", "data_atualizacao", "TIMESTAMP", "SIM", "N", "Atualização"],
        ]),
        ("p", "Remover da doc antiga: unidade_medida, tamanho_comercial, estoque (passou para estoque_material)."),
        ("h1", "PARTE 3 — Classes, Casos de Uso e Sequências"),
        ("h2", "Tabela 1 — Identificação das Classes (atualizada)"),
        ("table", [
            ["Classes", "Identificação"],
            ["Pessoa / Usuário", "Login, autenticação, perfis Admin/Gerente/Funcionario"],
            ["CotacaoServico", "Orçamento, medidas L×A×folga, tipo produto/serviço, custos"],
            ["Material", "Item da cotação: qtd, metros, peso kg"],
            ["MaterialDisponivel", "Catálogo: unidade, comprimento barra mm, peso kg/m"],
            ["MaterialPreco", "Preços por material e distribuidora"],
            ["Distribuidora", "Fornecedores"],
            ["ContaFinanceira", "Pagar/receber, parcelamento"],
            ["Simulacao / SimulacaoItem", "Consumo; atalho para compra"],
            ["TipoServico / TipoServicoItem", "Template de produção"],
            ["OrdemServico", "OS da cotação; status oficina"],
            ["ItemCorte", "Plano de corte"],
            ["OrdemServicoMaoDeObra", "Horas/valor por etapa"],
            ["FuncionarioOficina", "Cadastro oficina valor/hora"],
            ["CompraLote / CompraLoteItem", "Compra kg/m/barras; ATIVA/CANCELADA"],
            ["EstoqueMaterial", "Saldo kg/m/barras"],
            ["MovimentacaoEstoque", "Histórico entradas/saídas"],
            ["Retalho", "Sobra reutilizável"],
            ["ConfiguracaoWhatsapp / WhatsappEnvioLog", "WPPConnect"],
            ["Produto", "Catálogo comercial"],
            ["Permissao / PermissaoPessoa", "Perfis"],
            ["Estado / Cidade", "Localização"],
        ]),
        ("h2", "Casos de uso novos"),
        ("bullets", [
            "UC-OS-01 Gerar OS a partir da cotação (Gerente, Funcionario, Admin)",
            "UC-OS-02 Acompanhar status da OS",
            "UC-OS-03 Gerar lista de corte e baixar estoque",
            "UC-OS-04 Lançar mão de obra na OS",
            "UC-TS-01 Cadastrar Tipo de Serviço",
            "UC-TS-02 Montar materiais da cotação via template + medidas",
            "UC-FO-01 Cadastrar Funcionário da oficina (Gerente, Admin)",
            "UC-CL-01 Registrar Compra de lote",
            "UC-CL-02 Cancelar compra (estorno)",
            "UC-CL-03 Gerar compra a partir da simulação",
            "UC-ES-01 Consultar estoque e retalhos (Gerente, Admin)",
        ]),
        ("h2", "Sequências novas (Figuras 22–28)"),
        ("bullets", [
            "22 Gerar OS: VisualizarCotacao → POST /api/ordens-servico → OrdemServicoService → PostgreSQL",
            "23 Lista de corte: OS → ItemCorte → EstoqueService (baixa + retalho + MovimentacaoEstoque)",
            "24 Mão de obra: funcionário + etapa + horas → OrdemServicoMaoDeObra",
            "25 Compra lote: POST /api/compras-lote → entrada EstoqueMaterial ENTRADA_COMPRA",
            "26 Cancelar compra: status CANCELADA + estorno estoque",
            "27 Compra da simulação: navega FormularioCompraLote pré-preenchido",
            "28 Tipo serviço + cotação: GET template → calcula metros → POST cotação",
        ]),
        ("p", "Diagramas Mermaid estão em PARTE3_Classes_Casos_Sequencias.md — exportar PNG em mermaid.live e colar no TCC."),
        ("h1", "PARTE 4 — Textos para Capítulos"),
        ("h2", "RESUMO"),
        ("p", "Este projeto tem como objetivo desenvolver um software web para a HSA Serralheria, empresa cuja atividade principal é a fabricação de artigos de serralheria (CNAE 25.42-0-00), e secundárias incluem serviços de usinagem, tornearia e solda (CNAE 25.39-0-01), fabricação de esquadrias de metal (CNAE 25.12-8-00), além de estruturas metálicas e obras em ferro. O sistema automatiza orçamentos e cotações com cálculo de custos, medidas e templates de tipos de serviço; integra gestão financeira (contas a pagar e receber, parcelamento e cobrança), simulação de produção, compras de material em lote, estoque com retalhos, ordens de serviço com lista de corte e mão de obra, catálogo de produtos, importação de planilhas de preços e WhatsApp via WPPConnect para envio de PDFs e cobranças. Na segurança, utilizam-se Spring Security e JWT com perfis Admin, Gerente e Funcionario. O back-end foi desenvolvido em Java 21 com Spring Boot 3.3.4, Spring Data JPA, PostgreSQL e JasperReports. No front-end, utilizou-se React com PrimeReact, consumindo a API via Axios."),
        ("p", "Palavras-chave: Sistema Web. Orçamentos Automatizados. Serralheria. Ordem de Serviço. Estoque. Java. Spring Boot. WhatsApp."),
        ("h2", "ABSTRACT"),
        ("p", "This project aims to develop a web software system for HSA Serralheria, whose primary activity is the manufacture of locksmith articles (CNAE 25.42-0-00), with secondary activities including machining, turning and welding (CNAE 25.39-0-01), metal frames (CNAE 25.12-8-00), and related metal structures. The system automates quotations with measurements and service-type templates; integrates financial management, production simulation, bulk material purchasing, inventory with scrap reuse, work orders with cut lists and labor tracking, product catalog, spreadsheet price import, and WhatsApp via WPPConnect. Security relies on Spring Security and JWT with Admin, Gerente and Funcionario roles. Back-end: Java 21, Spring Boot 3.3.4, JPA, PostgreSQL, JasperReports. Front-end: React with PrimeReact and Axios."),
        ("p", "Keywords: Web System. Automated Budgeting. Locksmith Industry. Work Order. Inventory. Java. Spring Boot. WhatsApp."),
        ("h2", "3.1 / 3.3 — números e escopo"),
        ("p", "Back-end: 27 controllers, 37 services, 32 repositories, 45 classes no pacote entity. Front-end: React 19 com 21 páginas e 21 services. Incluir no 3.1: OS, templates, corte/estoque, compra lote, mão de obra."),
        ("h2", "8.1 Níveis de Acesso"),
        ("table", [
            ["Módulo", "Funcionario", "Gerente", "Admin"],
            ["Home / Cotações / OS / Simulação", "Sim", "Sim", "Sim"],
            ["Tipos de serviço / Func. oficina", "Não", "Sim", "Sim"],
            ["Compras lote / Estoque", "Não", "Sim", "Sim"],
            ["Financeiro / Materiais / Config", "Não", "Sim", "Sim"],
            ["Gestão de usuários", "Não", "—", "Sim"],
        ]),
        ("h2", "9 Conclusão — números"),
        ("p", "27 controllers REST, 37 services, 32 repositories e 45 classes no pacote de entidades JPA, persistidas em PostgreSQL. Escopo ampliado: oficina (OS, corte, retalhos, MO), compras e estoque além de financeiro e WhatsApp."),
        ("h1", "Como usar este arquivo"),
        ("bullets", [
            "Copiar textos e tabelas para o ODT acadêmico (TCC v2), respeitando Times New Roman e margens do Detalhamento do Modelo",
            "Refazer Figuras 2, 3 e 20; acrescentar Figuras 22–28 a partir do Mermaid da Parte 3",
            "Arquivos fonte Markdown permanecem em Documentacao_TCC/PARTE1…PARTE4",
        ]),
    ]


# ---------- ODT ----------

def build_odt(path: Path):
    doc = OpenDocumentText()
    doc.fontfacedecls.addElement(FontFace(name="Times New Roman", fontfamily="Times New Roman"))

    def add_style(name, family, **kwargs):
        st = Style(name=name, family=family)
        if family == "paragraph":
            pp = ParagraphProperties(**{k: v for k, v in kwargs.items() if k.startswith("margin") or k in ("textalign", "fo:margin-top",)})
            # simpler: use TextProperties + ParagraphProperties manually
        return st

    st_title = Style(name="TituloDoc", family="paragraph")
    st_title.addElement(ParagraphProperties(marginbottom="0.4cm", textalign="center"))
    st_title.addElement(TextProperties(fontsize="16pt", fontweight="bold", fontname="Times New Roman"))
    doc.styles.addElement(st_title)

    st_sub = Style(name="SubtituloDoc", family="paragraph")
    st_sub.addElement(ParagraphProperties(marginbottom="0.6cm", textalign="center"))
    st_sub.addElement(TextProperties(fontsize="12pt", fontname="Times New Roman"))
    doc.styles.addElement(st_sub)

    st_h1 = Style(name="Heading_20_1", family="paragraph")
    st_h1.addElement(ParagraphProperties(margintop="0.5cm", marginbottom="0.25cm"))
    st_h1.addElement(TextProperties(fontsize="14pt", fontweight="bold", fontname="Times New Roman"))
    doc.styles.addElement(st_h1)

    st_h2 = Style(name="Heading_20_2", family="paragraph")
    st_h2.addElement(ParagraphProperties(margintop="0.35cm", marginbottom="0.2cm"))
    st_h2.addElement(TextProperties(fontsize="12pt", fontweight="bold", fontname="Times New Roman"))
    doc.styles.addElement(st_h2)

    st_body = Style(name="Corpo", family="paragraph")
    st_body.addElement(ParagraphProperties(marginbottom="0.2cm", textalign="justify"))
    st_body.addElement(TextProperties(fontsize="12pt", fontname="Times New Roman"))
    doc.styles.addElement(st_body)

    st_bullet = Style(name="ItemLista", family="paragraph")
    st_bullet.addElement(ParagraphProperties(marginleft="0.5cm", marginbottom="0.1cm"))
    st_bullet.addElement(TextProperties(fontsize="11pt", fontname="Times New Roman"))
    doc.styles.addElement(st_bullet)

    st_cell = Style(name="Celula", family="paragraph")
    st_cell.addElement(TextProperties(fontsize="9pt", fontname="Times New Roman"))
    doc.styles.addElement(st_cell)

    st_cell_h = Style(name="CelulaCab", family="paragraph")
    st_cell_h.addElement(TextProperties(fontsize="9pt", fontweight="bold", fontname="Times New Roman"))
    doc.styles.addElement(st_cell_h)

    for kind, data in sections():
        if kind == "title":
            p = P(stylename=st_title)
            teletype.addTextToElement(p, data)
            doc.text.addElement(p)
        elif kind == "subtitle":
            for line in data.split("\n"):
                p = P(stylename=st_sub)
                teletype.addTextToElement(p, line)
                doc.text.addElement(p)
        elif kind == "h1":
            h = H(outlinelevel=1, stylename=st_h1)
            teletype.addTextToElement(h, data)
            doc.text.addElement(h)
        elif kind == "h2":
            h = H(outlinelevel=2, stylename=st_h2)
            teletype.addTextToElement(h, data)
            doc.text.addElement(h)
        elif kind == "p":
            p = P(stylename=st_body)
            teletype.addTextToElement(p, data)
            doc.text.addElement(p)
        elif kind == "bullets":
            for item in data:
                p = P(stylename=st_bullet)
                teletype.addTextToElement(p, "• " + item)
                doc.text.addElement(p)
        elif kind == "table":
            table = Table(name="T" + str(id(data)))
            cols = len(data[0])
            for _ in range(cols):
                table.addElement(TableColumn())
            for r_i, row in enumerate(data):
                tr = TableRow()
                for cell in row:
                    tc = TableCell()
                    pc = P(stylename=st_cell_h if r_i == 0 else st_cell)
                    teletype.addTextToElement(pc, str(cell))
                    tc.addElement(pc)
                    tr.addElement(tc)
                table.addElement(tr)
            doc.text.addElement(table)
            doc.text.addElement(P(stylename=st_body))  # spacing

    doc.save(str(path))
    print("ODT:", path)


# ---------- PDF ----------

class DocPDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("TNR", "", 8)
        self.cell(0, 10, str(self.page_no()), align="C")


def build_pdf(path: Path):
    fonts = OUT / "fonts"
    pdf = DocPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_font("TNR", "", str(fonts / "times.ttf"))
    pdf.add_font("TNR", "B", str(fonts / "timesbd.ttf"))
    pdf.set_margins(20, 20, 20)
    pdf.add_page()
    pdf.set_x(pdf.l_margin)

    def reset_x():
        pdf.set_x(pdf.l_margin)

    def title(t, size=15):
        reset_x()
        pdf.set_font("TNR", "B", size)
        pdf.multi_cell(0, 8, t, align="C")
        pdf.ln(2)

    def h1(t):
        pdf.ln(4)
        reset_x()
        pdf.set_font("TNR", "B", 13)
        pdf.multi_cell(0, 7, t)
        pdf.ln(1)

    def h2(t):
        pdf.ln(3)
        reset_x()
        pdf.set_font("TNR", "B", 11)
        pdf.multi_cell(0, 6, t)
        pdf.ln(1)

    def body(t):
        reset_x()
        pdf.set_font("TNR", "", 10)
        pdf.multi_cell(0, 5, t)
        pdf.ln(1)

    def bullets(items):
        pdf.set_font("TNR", "", 9)
        for it in items:
            reset_x()
            pdf.multi_cell(0, 5, "• " + it)
        pdf.ln(1)

    def table(rows):
        usable = pdf.w - pdf.l_margin - pdf.r_margin
        cols = len(rows[0])
        if cols == 2:
            widths = [usable * 0.35, usable * 0.65]
        elif cols == 4:
            widths = [usable * 0.40, usable * 0.20, usable * 0.20, usable * 0.20]
        elif cols == 6:
            widths = [usable * 0.10, usable * 0.22, usable * 0.18, usable * 0.08, usable * 0.08, usable * 0.34]
        else:
            widths = [usable / cols] * cols
        line_h = 3.5
        for r_i, row in enumerate(rows):
            max_h = line_h + 1
            for i, cell in enumerate(row):
                tw = pdf.get_string_width(str(cell)[:100])
                lines = max(1, int(tw / max(widths[i] - 2, 1)) + 1)
                max_h = max(max_h, lines * line_h + 1)
            max_h = min(max_h, 16)
            if pdf.get_y() + max_h > pdf.h - 20:
                pdf.add_page()
            x0, y0 = pdf.get_x(), pdf.get_y()
            for i, cell in enumerate(row):
                pdf.set_xy(x0 + sum(widths[:i]), y0)
                pdf.set_font("TNR", "B" if r_i == 0 else "", 7)
                pdf.rect(x0 + sum(widths[:i]), y0, widths[i], max_h)
                pdf.multi_cell(widths[i], line_h, str(cell)[:100], border=0)
            pdf.set_xy(pdf.l_margin, y0 + max_h)
        pdf.ln(2)
        reset_x()

    for kind, data in sections():
        if kind == "title":
            title(data, 15)
        elif kind == "subtitle":
            pdf.set_font("TNR", "", 10)
            for line in data.split("\n"):
                reset_x()
                pdf.multi_cell(0, 5, line, align="C")
            pdf.ln(3)
        elif kind == "h1":
            h1(data)
        elif kind == "h2":
            h2(data)
        elif kind == "p":
            body(data)
        elif kind == "bullets":
            bullets(data)
        elif kind == "table":
            table(data)

    pdf.output(str(path))
    print("PDF:", path)


if __name__ == "__main__":
    build_odt(OUT / "HSA_TCC_Atualizacao_Documentacao.odt")
    build_pdf(OUT / "HSA_TCC_Atualizacao_Documentacao.pdf")
