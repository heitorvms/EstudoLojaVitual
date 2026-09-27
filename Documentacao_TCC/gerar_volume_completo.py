# -*- coding: utf-8 -*-
"""Gera o Volume completo do TCC HSA Serralheria (atualizado ao sistema)."""
from pathlib import Path
from fpdf import FPDF

ROOT = Path(__file__).resolve().parent
DIAG = ROOT / "diagramas"
FONTS = ROOT / "fonts"
V2 = Path(r"c:/Users/Heitor/Downloads/HSA_V2_imgs")
VOL = Path(r"c:/Users/Heitor/Downloads/HSA_Volume_imgs")
OUT_PDF = ROOT / "HSA_Serralheria_Volume_Atualizado.pdf"
OUT_COD = Path(r"c:/Users/Heitor/OneDrive/Área de Trabalho/cod_tcc") / "HSA_Serralheria_Volume_Atualizado.pdf"

# Margens estilo monografia (cm ≈)
ML, MR, MT, MB = 30, 20, 25, 25  # mm

SEQ = "Diagrama de Sequência – "
FIGURAS = {
    "organograma": "Figura 1 – Organograma Funcional e de Processos da Empresa",
    "casos_uso": "Figura 2 – Diagrama de Caso de Uso",
    "classes": "Figura 3 – Diagrama de Classe",
    "login": f"Figura 4 – {SEQ}Login",
    "orcamento": f"Figura 5 – {SEQ}Cadastro de Orçamento",
    "pdf": f"Figura 6 – {SEQ}Geração de Orçamento PDF",
    "funcionario": f"Figura 7 – {SEQ}Cadastro de Funcionário da Oficina",
    "relatorios": f"Figura 8 – {SEQ}Geração de Relatórios",
    "permissoes": f"Figura 9 – {SEQ}Controle de Permissões",
    "listar": "Figura 10 – Diagrama de Sequência Genérico – Listar Dado",
    "criar": "Figura 11 – Diagrama de Sequência Genérico – Criar Dado",
    "editar": "Figura 12 – Diagrama de Sequência Genérico – Editar Dado",
    "excluir": "Figura 13 – Diagrama de Sequência Genérico – Excluir Dado",
    "whatsapp": f"Figura 14 – {SEQ}Envio de Orçamento via WhatsApp",
    "financeiro": f"Figura 15 – {SEQ}Módulo Financeiro e Cobrança",
    "simulacao": f"Figura 16 – {SEQ}Simulação de Produção e Modelos Padronizados",
    "wpp_conexao": f"Figura 17 – {SEQ}Conexão WhatsApp (WPPConnect)",
    "gerar_os": f"Figura 18 – {SEQ}Gerar Ordem de Serviço a partir da Cotação",
    "status_os": f"Figura 19 – {SEQ}Alterar Status da OS e Baixa de Estoque",
    "mao_obra": f"Figura 20 – {SEQ}Lançar Mão de Obra na OS",
    "pagamento_mo": f"Figura 21 – {SEQ}Pagamento de Mão de Obra ao Funcionário",
    "recebimento_os": f"Figura 22 – {SEQ}Quitar e Estornar Recebimento pela OS",
    "cancelar_os": f"Figura 23 – {SEQ}Cancelar Ordem de Serviço",
    "compra": f"Figura 24 – {SEQ}Compra de Material em Lote",
    "cancelar_compra": f"Figura 25 – {SEQ}Cancelar Compra de Material",
    "orcamento_simulacao": f"Figura 26 – {SEQ}Gerar Orçamento a partir da Simulação",
    "deploy": "Figura 27 – Diagrama de Deploy",
    "componentes": "Figura 28 – Diagrama de Componentes",
    "der": "Figura 29 – Diagrama de Entidade e Relacionamento (DER)",
    "arquitetura": "Figura 30 – Projeto Arquitetural",
}

TABELAS_DICIONARIO = [
    "Pessoa", "Permissao", "Permissao_Pessoa", "Cotacao_Servico", "Material", "Material_Disponivel",
    "Material_Preco", "Distribuidora", "Simulacao", "Simulacao_Item", "Ordem_Servico",
    "Ordem_Servico_Mao_Obra", "Funcionario_Oficina", "Conta_Financeira", "Cobranca_Whatsapp_Historico",
    "Compra_Lote", "Compra_Lote_Item", "Estoque_Material", "Movimentacao_Estoque",
    "Configuracao_Whatsapp", "Whatsapp_Envio_Log",
]


class Volume(FPDF):
    def __init__(self):
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=True, margin=MB)
        self.add_font("TNR", "", str(FONTS / "times.ttf"))
        self.add_font("TNR", "B", str(FONTS / "timesbd.ttf"))
        self.set_margins(ML, MT, MR)
        self._skip_footer = False

    def footer(self):
        if self._skip_footer or self.page_no() < 5:
            return
        self.set_y(-15)
        self.set_font("TNR", "", 10)
        self.cell(0, 10, str(self.page_no()), align="C")

    def reset_x(self):
        self.set_x(self.l_margin)

    def h1(self, t):
        self.ln(4)
        self.reset_x()
        self.set_font("TNR", "B", 12)
        self.multi_cell(0, 7, t.upper())
        self.ln(2)

    def evitar_orfao(self, espaco_mm=35):
        if self.get_y() + espaco_mm > self.h - MB:
            self.add_page()

    def h2(self, t):
        self.evitar_orfao()
        self.ln(3)
        self.reset_x()
        self.set_font("TNR", "B", 12)
        self.multi_cell(0, 6, t)
        self.ln(1)

    def h3(self, t):
        self.evitar_orfao()
        self.ln(2)
        self.reset_x()
        self.set_font("TNR", "B", 12)
        self.multi_cell(0, 6, t)
        self.ln(1)

    def body(self, t, first=False):
        self.reset_x()
        self.set_font("TNR", "", 12)
        with self.text_columns(text_align="J", line_height=1.42) as colunas:
            with colunas.paragraph(first_line_indent=0 if first else 12.5) as paragrafo:
                paragrafo.write(t)
        self.ln(1)

    def bullet(self, t):
        self.reset_x()
        self.set_font("TNR", "", 12)
        self.set_x(self.l_margin + 8)
        self.multi_cell(self.w - self.r_margin - self.l_margin - 8, 6, "• " + t)
        self.ln(0.5)

    def caption(self, t):
        self.reset_x()
        self.set_font("TNR", "", 10)
        self.multi_cell(0, 5, t, align="C")
        self.reset_x()
        self.set_font("TNR", "", 10)
        self.multi_cell(0, 5, "Fonte: Do autor", align="C")
        self.ln(2)
        self.reset_x()

    def add_fig(self, path, caption, max_h=120):
        path = Path(path)
        if not path.exists():
            self.body(f"[Figura indisponível: {path.name}]", first=True)
            return
        self.ln(2)
        self.reset_x()
        usable_w = self.w - self.l_margin - self.r_margin
        from PIL import Image
        im = Image.open(path)
        iw, ih = im.size
        w = usable_w
        h = w * ih / iw
        if h > max_h:
            h = max_h
            w = h * iw / ih
        if self.get_y() + h + 18 > self.h - MB:
            self.add_page()
            self.reset_x()
        x = self.l_margin + (usable_w - w) / 2
        self.image(str(path), x=x, y=self.get_y(), w=w, h=h)
        self.set_y(self.get_y() + h + 2)
        self.reset_x()
        self.caption(caption)

    def table(self, rows, col_w=None, titulo=None):
        usable = self.w - self.l_margin - self.r_margin
        cols = len(rows[0])
        if col_w is None:
            col_w = [usable / cols] * cols
        line_h = 4.2
        if titulo:
            if self.get_y() + 25 > self.h - MB:
                self.add_page()
            self.reset_x()
            self.set_font("TNR", "", 10)
            self.multi_cell(0, 5, titulo, align="C")
            self.ln(1)
        for r_i, row in enumerate(rows):
            # altura
            max_h = line_h + 1
            for i, cell in enumerate(row):
                tw = self.get_string_width(str(cell)[:90])
                lines = max(1, int(tw / max(col_w[i] - 1, 1)) + 1)
                max_h = max(max_h, min(lines, 4) * line_h + 1)
            if self.get_y() + max_h > self.h - MB - 5:
                self.add_page()
            x0, y0 = self.l_margin, self.get_y()
            for i, cell in enumerate(row):
                self.set_xy(x0 + sum(col_w[:i]), y0)
                self.set_font("TNR", "B" if r_i == 0 else "", 8)
                self.rect(x0 + sum(col_w[:i]), y0, col_w[i], max_h)
                self.multi_cell(col_w[i], line_h, str(cell)[:110], border=0)
            self.set_xy(self.l_margin, y0 + max_h)
        self.ln(2)
        self.reset_x()
        self.set_font("TNR", "", 10)
        self.multi_cell(0, 5, "Fonte: Do autor", align="C")
        self.ln(2)


def blank_front(pdf: Volume, lines_center):
    pdf._skip_footer = True
    pdf.add_page()
    pdf.set_y(40)
    for t, size, bold, gap in lines_center:
        pdf.reset_x()
        pdf.set_font("TNR", "B" if bold else "", size)
        pdf.multi_cell(0, size * 0.5, t, align="C")
        pdf.ln(gap)
    pdf._skip_footer = False


def build():
    pdf = Volume()

    # ===== CAPA =====
    blank_front(pdf, [
        ("UNIVERSIDADE PARANAENSE", 14, True, 2),
        ("CURSO DE SISTEMAS DE INFORMAÇÃO", 12, True, 30),
        ("Heitor Venâncio Marins da Silva", 14, True, 25),
        ("Sistema Web para Geração Automatizada de Orçamentos", 14, True, 1),
        ("Comerciais, Ordens de Serviço e Gestão de Estoque", 14, True, 1),
        ("Utilizando Java com Spring Boot", 14, True, 40),
        ("PARANAVAÍ", 12, True, 1),
        ("2026", 12, True, 1),
    ])

    # ===== FOLHA ROSTO =====
    blank_front(pdf, [
        ("Heitor Venâncio Marins da Silva", 14, True, 20),
        ("Sistema Web para Geração Automatizada de Orçamentos", 13, True, 1),
        ("Comerciais, Ordens de Serviço e Gestão de Estoque", 13, True, 1),
        ("Utilizando Java com Spring Boot", 13, True, 15),
        ("Trabalho do Estágio Supervisionado em Sistemas de Informação apresentado à banca examinadora do curso de Estágio Supervisionado em Sistemas de Informação da Universidade Paranaense - UNIPAR.", 11, False, 8),
        ("Orientação: Prof. Me. Jaime William Dias", 12, False, 30),
        ("PARANAVAÍ", 12, True, 1),
        ("2026", 12, True, 1),
    ])

    # ===== BANCA =====
    blank_front(pdf, [
        ("Heitor Venâncio Marins da Silva", 14, True, 12),
        ("Sistema Web para Geração Automatizada de Orçamentos", 12, True, 1),
        ("Comerciais, Ordens de Serviço e Gestão de Estoque", 12, True, 1),
        ("Utilizando Java com Spring Boot", 12, True, 10),
        ("Trabalho de Estágio Supervisionado em Sistemas de Informação aprovado como requisito parcial para obtenção de grau da Universidade Paranaense – UNIPAR, pela seguinte banca examinadora:", 11, False, 12),
        ("_________________________________________________", 11, False, 1),
        ("Prof. Me. Jaime William Dias", 11, False, 1),
        ("Mestre em Ciência da Computação", 11, False, 10),
        ("_________________________________________________", 11, False, 1),
        ("Prof. Esp. Ricardo Ribeiro Rufino", 11, False, 1),
        ("Especialista em Programação Orientado a Objetos", 11, False, 8),
        ("Paranavaí, 2026", 11, False, 1),
    ])

    # ===== AGRADECIMENTO =====
    pdf.add_page()
    pdf.set_font("TNR", "B", 12)
    pdf.multi_cell(0, 7, "AGRADECIMENTO", align="C")
    pdf.ln(8)
    agrad = (
        "Quero registrar minha profunda gratidão aos meus pais, que se dedicam incansavelmente a me apoiar em todas as situações da vida; "
        "eles são a minha maior fonte de inspiração e me transmitem força para seguir adiante.\n\n"
        "Agradeço também a Deus, por iluminar minhas ideias durante o desenvolvimento deste projeto e por guiar-me na correção de erros "
        "que eu jamais imaginaria solucionar sozinho. Ao meu primo Matheus, expresso meu reconhecimento: é em seu exemplo que me espelho "
        "e cujos conselhos sempre procuro seguir.\n\n"
        "Por fim, agradeço aos professores Jaime e Rufino, cuja admiração e ensinamentos, ainda que em conversas breves, tiveram grande "
        "impacto em minha trajetória acadêmica e pessoal.\n\n"
        "\"A verdadeira obra de arte da vida é saber transformar cada ajuda em gratidão e cada obstáculo em aprendizado.\" (Geraldo Eustáquio)."
    )
    pdf.set_font("TNR", "", 12)
    pdf.multi_cell(0, 7, agrad, align="J")

    # ===== RESUMO =====
    pdf.add_page()
    pdf.set_font("TNR", "B", 12)
    pdf.multi_cell(0, 7, "RESUMO", align="C")
    pdf.ln(6)
    pdf.set_font("TNR", "", 12)
    pdf.set_left_margin(ML + 8)
    pdf.set_right_margin(MR + 8)
    pdf.set_x(ML + 8)
    resumo = (
        "Este projeto tem como objetivo desenvolver um software web para a HSA Serralheria, empresa cuja atividade principal é a "
        "fabricação de artigos de serralheria (CNAE 25.42-0-00), e secundárias incluem serviços de usinagem, tornearia e solda "
        "(CNAE 25.39-0-01), fabricação de esquadrias de metal (CNAE 25.12-8-00), além de estruturas metálicas e obras em ferro. "
        "O sistema automatiza orçamentos e cotações com cálculo de custos de materiais, insumos, frete e lucro, escolhendo a "
        "distribuidora de menor preço; oferece simulação de produção com modelos padronizados que podem ser convertidos em "
        "orçamento; gera ordens de serviço a partir da cotação, com baixa automática de estoque e lançamento de mão de obra "
        "diurna e noturna com controle de pagamento aos funcionários; produz contas a pagar e a receber por categoria a partir "
        "da ordem de serviço; controla compras de material em lote e saldos de estoque; importa planilhas de preços e envia "
        "orçamentos e cobranças via WhatsApp (WPPConnect). Na segurança, utilizam-se Spring Security e JWT com perfis Admin, "
        "Gerente e Funcionario. Back-end: Java 21, Spring Boot 3.3.4, JPA/Hibernate, PostgreSQL e JasperReports. Front-end: "
        "React com PrimeReact e Axios."
    )
    pdf.multi_cell(0, 6, resumo, align="J")
    pdf.ln(4)
    pdf.set_font("TNR", "B", 12)
    pdf.write(6, "Palavras-chave: ")
    pdf.set_font("TNR", "", 12)
    pdf.write(6, "Sistema Web. Orçamentos Automatizados. Serralheria. Ordem de Serviço. Estoque. Java. Spring Boot. WhatsApp.")
    pdf.ln(8)
    pdf.set_margins(ML, MT, MR)

    # ===== ABSTRACT =====
    pdf.add_page()
    pdf.set_font("TNR", "B", 12)
    pdf.multi_cell(0, 7, "ABSTRACT", align="C")
    pdf.ln(6)
    pdf.set_left_margin(ML + 8)
    pdf.set_right_margin(MR + 8)
    pdf.set_x(ML + 8)
    pdf.set_font("TNR", "", 12)
    abstract = (
        "This project aims to develop a web software system for HSA Serralheria, whose primary activity is the manufacture of "
        "locksmith articles (CNAE 25.42-0-00), with secondary activities including machining, turning and welding (CNAE 25.39-0-01), "
        "metal frames (CNAE 25.12-8-00), and related metal structures. The system automates quotations by calculating material, "
        "supplies, freight and profit costs, selecting the lowest-priced supplier; provides production simulation with standard "
        "models that can be converted into quotations; generates work orders from quotations, with automatic inventory deduction "
        "and day/night labor tracking including employee payment control; creates accounts payable and receivable by category "
        "from the work order; manages bulk material purchases and inventory balances; imports price spreadsheets; and sends "
        "quotations and payment reminders via WhatsApp (WPPConnect). Security relies on Spring Security and JWT (Admin, Gerente, "
        "Funcionario). Back-end: Java 21, Spring Boot 3.3.4, JPA/Hibernate, PostgreSQL, JasperReports. Front-end: React with "
        "PrimeReact and Axios."
    )
    pdf.multi_cell(0, 6, abstract, align="J")
    pdf.ln(4)
    pdf.set_font("TNR", "B", 12)
    pdf.write(6, "Keywords: ")
    pdf.set_font("TNR", "", 12)
    pdf.write(6, "Web System. Automated Budgeting. Locksmith Industry. Work Order. Inventory. Java. Spring Boot. WhatsApp.")
    pdf.set_margins(ML, MT, MR)

    # ===== LISTAS =====
    pdf.add_page()
    pdf.set_font("TNR", "B", 12)
    pdf.multi_cell(0, 7, "LISTA DE ILUSTRAÇÕES", align="C")
    pdf.ln(4)
    pdf.set_font("TNR", "", 11)
    for f in FIGURAS.values():
        pdf.reset_x()
        pdf.multi_cell(0, 5.5, f)

    pdf.add_page()
    pdf.set_font("TNR", "B", 12)
    pdf.multi_cell(0, 7, "LISTA DE TABELAS", align="C")
    pdf.ln(4)
    tabs = [
        "Tabela 1 – Stack Tecnológica do Sistema",
        "Tabela 2 – Identificação das Classes do Sistema",
    ] + [f"Tabela {i} – Dicionário de Dados da Tabela {nome}" for i, nome in enumerate(TABELAS_DICIONARIO, start=3)] + [
        f"Tabela {3 + len(TABELAS_DICIONARIO)} – Matriz de Níveis de Acesso por Módulo",
    ]
    pdf.set_font("TNR", "", 11)
    for t in tabs:
        pdf.reset_x()
        pdf.multi_cell(0, 5.5, t)

    pdf.add_page()
    pdf.set_font("TNR", "B", 12)
    pdf.multi_cell(0, 7, "SUMÁRIO", align="C")
    pdf.ln(4)
    sumario = """1. INTRODUÇÃO
2. DESCRIÇÃO DA EMPRESA
   2.1. Histórico da Empresa
   2.1.1. Missão da Empresa
   2.1.2. Ramo de Atividade
   2.2. Organograma
   2.3. Descrições do Setor de Informática
   2.4. Identificação da Situação Atual da Empresa
3. DESCRIÇÃO DO AMBIENTE E DO PRODUTO COMPUTACIONAL
   3.1. Identificação do Sistema a Ser Desenvolvido
   3.2. Objetivos Gerais do Sistema
   3.3. Ambiente Tecnológico e Ferramentas Utilizadas
4. VIABILIDADE DO NOVO SISTEMA
5. PROJETO DOS OBJETOS
   5.1. Diagrama de Caso de Uso
   5.2. Identificação Preliminar das Classes
   5.3. Diagrama de Classe
   5.4. Diagramas de Sequência
   5.5. Diagrama de Distribuição e Componentes
6. PROJETO DOS DADOS
   6.1. Diagrama Entidade-Relacionamento (DER)
   6.2. Dicionários de Dados
7. PROJETO ARQUITETURAL
8. PROJETO PROCEDIMENTAL
   8.1. Níveis de Acesso
9. CONCLUSÃO
REFERÊNCIAS"""
    pdf.set_font("TNR", "", 11)
    for line in sumario.split("\n"):
        pdf.reset_x()
        pdf.multi_cell(0, 5.5, line)

    # ===== CAP 1 =====
    pdf.add_page()
    pdf.h1("1. Introdução")
    pdf.body(
        '"O software distribui o produto mais importante de nossa era – a informação. Ele transforma dados pessoais [...] em conhecimento útil, quando organizados e interpretados corretamente." (PRESSMAN; MAXIM, 2016, p. 24).',
        first=True,
    )
    pdf.body(
        "Com o avanço da tecnologia, tornou-se possível gerenciar atividades de forma mais prática, segura e eficiente. "
        "A distância deixou de ser um obstáculo e os sistemas passaram a ser acessíveis, com interfaces mais amigáveis, "
        "custos reduzidos e controle total dos processos de uma organização. Nesse cenário, o desenvolvimento de soluções "
        "computacionais se tornou indispensável para melhorar a produtividade e a qualidade nos mais diversos setores."
    )
    pdf.body(
        'De acordo com Sommerville (2011), "a engenharia de software é a aplicação de princípios, métodos e ferramentas '
        'para o desenvolvimento econômico de software confiável e que funcione eficientemente em máquinas reais." Com base '
        "nesse conceito, este projeto propõe o desenvolvimento de um sistema web moderno e funcional, utilizando tecnologias "
        "consolidadas no mercado como Java, Spring Boot, JWT, React, entre outras."
    )
    pdf.body(
        "O projeto está dividido em capítulos, cada um abordando uma etapa essencial do processo de desenvolvimento. "
        "O Capítulo 2 apresenta a descrição da empresa e suas motivações. O Capítulo 3 trata do ambiente e produto "
        "computacional. O Capítulo 4 contempla o estudo de viabilidade. No Capítulo 5 são apresentados os projetos de "
        "objetos com diagramas UML. O Capítulo 6 é dedicado ao projeto de dados. O Capítulo 7 compreende o projeto "
        "arquitetural. O Capítulo 8 apresenta o projeto procedimental com níveis de acesso. Por fim, são apresentadas as "
        "conclusões e referências."
    )

    # ===== CAP 2 =====
    pdf.add_page()
    pdf.h1("2. Descrição da Empresa")
    pdf.body(
        "Este capítulo apresenta um breve histórico da HSA Serralheria, identificando as suas origens, a missão que orienta "
        "suas atividades, o ramo de atuação e, por fim, descrevendo as ferramentas de informática disponíveis para suportar "
        "a implantação do novo software.",
        first=True,
    )
    pdf.h2("2.1. Histórico da Empresa")
    pdf.body(
        "A história da HSA Serralheria tem raízes na Fenasi Serralheria, fundada em 1979 por Osmarino em sociedade com seu "
        "irmão, com foco em grandes serviços para multinacionais. Em 2002, devido a divergências relacionadas à distribuição "
        "de valores, Osmarino e seu irmão encerraram a sociedade. Seu filho Alex permaneceu na Fenasi, trabalhando ao lado "
        "do tio e adquirindo valiosa experiência prática no segmento. Em 2012, munido desse conhecimento e determinado a "
        "aplicar sua visão, Alex fundou a HSA Serralheria, direcionada a serviços de menor porte. Desde então, a empresa "
        "especializou-se na fabricação em alta escala de cadeiras, mesas, portões e estruturas metálicas de pequeno e médio "
        "porte, destacando-se pela agilidade e qualidade no mercado local.",
        first=True,
    )
    pdf.h3("2.1.1. Missão da Empresa")
    pdf.body(
        "Oferecer ao mercado soluções em serralheria com qualidade, segurança e preços justos, criando valor para os clientes "
        "por meio de atendimento personalizado e processos de produção ágeis.",
        first=True,
    )
    pdf.h3("2.1.2. Ramo de Atividade")
    pdf.body("As atividades da empresa, conforme a Classificação Nacional de Atividades Econômicas (IBGE, 2026), são:", first=True)
    pdf.bullet("CNAE 25.42-0-00: Fabricação de artigos de serralheria (atividade principal)")
    pdf.bullet("CNAE 25.39-0-01: Serviços de usinagem, tornearia e solda (atividade secundária)")
    pdf.bullet("CNAE 25.12-8-00: Fabricação de esquadrias de metal (atividade secundária)")
    pdf.body("Atua ainda na produção de estruturas metálicas e obras em ferro sob medida para pequenos e médios projetos.")

    pdf.h2("2.2. Organograma")
    pdf.body(
        "A seguir apresenta-se o diagrama hierárquico dos principais setores e fluxos da empresa, evidenciando tanto a "
        "estrutura organizacional quanto os processos essenciais da produção à venda.",
        first=True,
    )
    organ = V2 / "p14_0.png" if (V2 / "p14_0.png").exists() else VOL / "p13_0.png"
    pdf.add_fig(organ, FIGURAS["organograma"], max_h=100)

    pdf.h2("2.3. Descrições do Setor de Informática")
    pdf.body(
        "Atualmente, a HSA Serralheria conta com uma infraestrutura de TI básica, porém suficiente para suportar a "
        "implantação do novo sistema web. A empresa dispõe de conexão à internet de 60 Mbps e utiliza uma impressora "
        "multifuncional compartilhada em rede.",
        first=True,
    )
    pdf.h3("2.3.1. Computador")
    pdf.bullet("Placa-mãe: ASUS H81")
    pdf.bullet("Processador: Intel Core i5-4570, 3,2 GHz")
    pdf.bullet("Memória RAM: 16 GB DDR4")
    pdf.bullet("HD: 500 GB Seagate")
    pdf.bullet("Placa de vídeo: NVIDIA GeForce GTX 1050 Ti")
    pdf.bullet("Monitor: LCD 20\" LG")
    pdf.bullet("Sistema operacional: Windows 10")
    pdf.h3("2.3.2. Rede e Compartilhamento")
    pdf.bullet("Link de Internet banda larga de 60 Mbps")
    pdf.bullet("Roteador com função de switch e Wi-Fi integrado")
    pdf.bullet("Impressora multifuncional HP Smart Tank 581, compartilhada em rede")

    pdf.h2("2.4. Identificação da Situação Atual da Empresa")
    pdf.body(
        "A HSA Serralheria não possuía um sistema informatizado dedicado ao gerenciamento de orçamentos e da produção. "
        "Todo o processo era realizado em planilhas eletrônicas (Excel) e o arquivamento era feito manualmente, por meio "
        "de impressão e armazenamento físico em papel. Essa prática dificultava a localização de orçamentos antigos, "
        "gerava acúmulo de documentos e sobrecarregava o fluxo de trabalho administrativo e da oficina.",
        first=True,
    )
    pdf.h3("2.4.1. Motivos que levaram ao Novo Sistema")
    pdf.body(
        "A inexistência de um sistema próprio para controle de orçamentos e estoque fazia com que atividades simples "
        "consumissem tempo excessivo. Com cerca de duzentos itens no portfólio de materiais, as planilhas não suportavam "
        "filtragem eficiente. O novo sistema cataloga materiais, automatiza cálculos de custos, gerencia o financeiro, "
        "controla estoque, compras, ordens de serviço e a mão de obra da oficina, e gera relatórios dinâmicos, garantindo "
        "agilidade e precisão.",
        first=True,
    )
    pdf.h3("2.4.2. Área de Abrangência")
    pdf.bullet("Operacional: cotações, ordens de serviço, lançamento de mão de obra e baixa de estoque")
    pdf.bullet("Gerencial: financeiro por categoria, compras em lote, estoque, funcionários da oficina e pagamento de mão de obra, fornecedores")
    pdf.bullet("Estratégico: relatórios e simulações de produção com modelos padronizados para apoio à decisão")

    # ===== CAP 3 =====
    pdf.add_page()
    pdf.h1("3. Descrição do Ambiente e do Produto Computacional")
    pdf.body(
        "Este capítulo apresenta o ambiente de desenvolvimento e o produto computacional desenvolvido, detalhando as "
        "tecnologias, ferramentas e funcionalidades do sistema. O objetivo do software é fornecer uma solução integrada "
        "para a gestão da empresa, desde materiais, cotações e clientes, até financeiro, oficina (OS), estoque e WhatsApp.",
        first=True,
    )
    pdf.h2("3.1. Identificação do Sistema a Ser Desenvolvido")
    for item in [
        "Criação de cotações com cálculo automático de custos de materiais, insumos, frete e lucro",
        "Análise automática da distribuidora com menor preço por material",
        "Geração de PDF de cotações via JasperReports",
        "Simulação de produção com cálculo de consumo, perdas, barras e sobras",
        "Modelos padronizados de simulação e geração de orçamento a partir da simulação",
        "Geração de ordem de serviço a partir da cotação, com status ABERTO, EM_PRODUCAO, CONCLUIDO e CANCELADO",
        "Baixa automática de estoque quando a OS entra em produção e devolução opcional no cancelamento",
        "Lançamento de mão de obra por funcionário, data de trabalho e turno (diurno ou noturno)",
        "Controle de pagamento de mão de obra aos funcionários, com resumo por período",
        "Geração de contas a receber (material e mão de obra, até 24 parcelas) e a pagar (material, insumos e frete) a partir da OS",
        "Quitação e estorno de recebimentos por categoria diretamente na OS",
        "Compra de material em lote (kg/metros/barras) com entrada no estoque e cancelamento com estorno",
        "Consulta de saldo de estoque e histórico de movimentações",
        "Envio de orçamentos e cobranças via WhatsApp (WPPConnect), individual ou em lote para contas vencidas",
        "Gestão de materiais, preços e distribuidoras, com importação de planilhas de preços",
        "Controle de usuários com perfis e recuperação de senha por e-mail",
    ]:
        pdf.bullet(item)

    pdf.h2("3.2. Objetivos Gerais do Sistema")
    for item in [
        "Automatizar o cálculo de orçamentos com base nos preços das distribuidoras",
        "Vincular cotação, ordem de serviço, estoque e financeiro no fluxo produtivo da oficina",
        "Controlar compras e saldos de material",
        "Controlar as horas trabalhadas e o pagamento dos funcionários da oficina",
        "Proporcionar gestão financeira integrada às ordens de serviço",
        "Facilitar a comunicação com clientes via WhatsApp",
        "Oferecer ambiente seguro com controle de acesso baseado em perfis",
        "Facilitar a geração de relatórios para decisões rápidas e precisas",
    ]:
        pdf.bullet(item)

    pdf.h2("3.3. Ambiente Tecnológico e Ferramentas Utilizadas")
    pdf.table(
        [
            ["Camada", "Tecnologia"],
            ["Backend", "Java 21, Spring Boot 3.3.4, Spring Security, JWT (jjwt 0.12.6), JPA/Hibernate, Lombok"],
            ["Banco de Dados", "PostgreSQL"],
            ["Frontend", "React 19, PrimeReact 10, Material UI 6, Tailwind CSS 4, Axios, Chart.js, React Router 7"],
            ["Relatórios", "JasperReports 7.0.3"],
            ["Planilhas", "Apache POI 5.3.0 (importação de preços)"],
            ["E-mail", "JavaMail com templates Freemarker (recuperação de senha)"],
            ["WhatsApp", "WPPConnect Server em contêiner Docker (porta 21465)"],
            ["Build", "Maven (backend), NPM (frontend)"],
        ],
        col_w=[45, 115],
        titulo="Tabela 1 – Stack Tecnológica do Sistema",
    )

    pdf.h3("3.3.1. Back-end")
    pdf.bullet("Linguagem: Java 21")
    pdf.bullet("Framework: Spring Boot 3.3.4")
    pdf.bullet("Segurança: Spring Security + JWT (BCryptPasswordEncoder)")
    pdf.bullet("Persistência: JPA/Hibernate — 30 entidades e 10 enums de domínio, 29 repositories")
    pdf.bullet("Camada REST: 26 controllers, 36 services de negócio e 44 DTOs")
    pdf.bullet("Banco: PostgreSQL")
    pdf.bullet("Relatórios: JasperReports 7.0.3")
    pdf.bullet("Planilhas: Apache POI para importação de preços de fornecedores")
    pdf.bullet("Integrações: JavaMail/Freemarker e RestTemplate (WPPConnect)")
    pdf.bullet("Agendamento: @Scheduled diário (6h) para marcar contas vencidas")

    pdf.h3("3.3.2. Front-end")
    pdf.bullet("React 19 com 20 páginas e 19 services, além do BaseService")
    pdf.bullet("PrimeReact e Material UI; Tailwind CSS e Styled-components")
    pdf.bullet("Axios com interceptor JWT (BaseService)")
    pdf.bullet("React Router com RoleRoute para controle de acesso por perfil")

    pdf.h3("3.3.3. Desenvolvimento e Integração")
    pdf.body(
        "O back-end e o front-end foram desenvolvidos de forma desacoplada com arquitetura RESTful. Para integração com "
        "WhatsApp, utiliza-se o WPPConnect Server executado em Docker na porta 21465, comunicando-se com o Spring Boot via "
        "HTTP (RestTemplate). O fluxo operacional parte da cotação, que pode ser criada diretamente ou a partir de uma "
        "simulação de produção; a cotação gera a ordem de serviço, que baixa o estoque ao entrar em produção, recebe os "
        "lançamentos de mão de obra e origina as contas a pagar e a receber. As compras em lote alimentam o estoque e, "
        "quando canceladas, estornam as quantidades.",
        first=True,
    )

    # ===== CAP 4 =====
    pdf.add_page()
    pdf.h1("4. Viabilidade do Novo Sistema")
    pdf.body(
        "Para o desenvolvimento e implantação do sistema, o estudo de viabilidade foi realizado previamente, considerando "
        "as necessidades organizacionais dentro de um cronograma planejado.",
        first=True,
    )
    pdf.h2("4.1. Viabilidade Econômica")
    pdf.body(
        "Para a implementação do novo sistema, foi aproveitada a infraestrutura tecnológica já existente. As tecnologias "
        "adotadas são majoritariamente open source, reduzindo custos de licenciamento. A integração WhatsApp utiliza o "
        "WPPConnect, solução gratuita executada localmente.",
        first=True,
    )
    pdf.h2("4.2. Viabilidade Técnica")
    pdf.body(
        "A stack tecnológica escolhida — Java 21, Spring Boot, React e PostgreSQL — é amplamente utilizada no mercado, "
        "com vasta documentação e comunidade ativa. O sistema foi desenvolvido com 26 controllers, 36 services, 29 "
        "repositories e 40 classes no pacote de entidades (30 entidades e 10 enums de domínio), cobrindo cotação, "
        "simulação, oficina, estoque e financeiro.",
        first=True,
    )
    pdf.h2("4.3. Viabilidade Legal")
    pdf.body(
        "O sistema foi desenvolvido com software livre e open source. Os dados pessoais de clientes e usuários são "
        "tratados apenas para a finalidade comercial da empresa, com senhas armazenadas de forma criptografada e acesso "
        "restrito por perfil, em conformidade com a Lei Geral de Proteção de Dados Pessoais (BRASIL, 2018). A integração "
        "WhatsApp segue as diretrizes de uso da plataforma.",
        first=True,
    )

    # ===== CAP 5 =====
    pdf.add_page()
    pdf.h1("5. Projeto dos Objetos")
    pdf.body(
        "Este capítulo apresenta os diagramas de caso de uso, classes, sequência e componentes do sistema HSA Serralheria, "
        "incluindo os módulos de simulação, ordem de serviço, mão de obra, estoque, compras e financeiro.",
        first=True,
    )
    pdf.h2("5.1. Diagrama de Caso de Uso")
    pdf.body(
        "O diagrama de caso de uso representa as principais funcionalidades e os atores do sistema. O ator Funcionário "
        "cadastra orçamentos, simula a produção, mantém modelos padronizados, gera ordens de serviço e lança mão de obra. "
        "O ator Gerente/Admin herda essas funcionalidades e acumula as rotinas gerenciais: compras, estoque, financeiro, "
        "cobrança, pagamento de funcionários, cadastros, usuários e configuração do WhatsApp. Cliente e WPPConnect "
        "aparecem como atores externos nas integrações de mensagens.",
        first=True,
    )
    pdf.add_fig(DIAG / "fig02_casos_uso.png", FIGURAS["casos_uso"], max_h=200)

    pdf.h2("5.2. Identificação Preliminar das Classes")
    pdf.table(
        [
            ["Classes", "Identificação"],
            ["Pessoa", "Usuários e clientes: login, autenticação, recuperação de senha e perfis"],
            ["Permissao / PermissaoPessoa", "Perfis Admin, Gerente e Funcionario e sua associação às pessoas"],
            ["Estado / Cidade", "Localização das pessoas"],
            ["CotacaoServico", "Orçamento: cliente, quantidade, custos de materiais, insumos, frete, lucro e total"],
            ["Material", "Item da cotação: material, quantidade, metros e peso"],
            ["PrecoMaterialCotacao", "Preço de cada material por distribuidora usado na cotação"],
            ["MaterialDisponivel", "Catálogo de materiais: unidade, comprimento da barra e peso por metro"],
            ["MaterialPreco", "Histórico de preços por material e distribuidora (manual, cotação ou importação)"],
            ["MaterialApelido", "Descrição do material no fornecedor, usada na importação de planilhas"],
            ["Distribuidora", "Fornecedores de material"],
            ["Simulacao / SimulacaoItem", "Simulação de consumo e custo; modelos padronizados reutilizáveis"],
            ["OrdemServico", "OS gerada da cotação; status da produção e controle de baixa de estoque"],
            ["OrdemServicoMaoDeObra", "Horas por funcionário, data e turno; controle de pagamento"],
            ["FuncionarioOficina", "Funcionários da oficina com valor/hora diurno e noturno"],
            ["ContaFinanceira", "Contas a pagar e a receber por categoria, com parcelamento e baixas"],
            ["CobrancaWhatsappHistorico", "Histórico das cobranças enviadas por WhatsApp"],
            ["CompraLote / CompraLoteItem", "Compra de material em kg, metros e barras"],
            ["EstoqueMaterial", "Saldo de estoque por material"],
            ["MovimentacaoEstoque", "Histórico de entradas, saídas e ajustes de estoque"],
            ["ConfiguracaoWhatsapp / WhatsappEnvioLog", "Configuração do WPPConnect e log de envios de orçamento"],
        ],
        col_w=[55, 105],
        titulo="Tabela 2 – Identificação das Classes do Sistema",
    )

    pdf.h2("5.3. Diagrama de Classe")
    pdf.body(
        "O diagrama de classe apresenta as entidades persistentes do sistema e seus relacionamentos. A cotação é a classe "
        "central: dela derivam os itens de material, os preços por distribuidora, a ordem de serviço, as contas "
        "financeiras e os envios de WhatsApp.",
        first=True,
    )
    pdf.add_fig(DIAG / "fig03_classes.png", FIGURAS["classes"], max_h=140)

    pdf.h2("5.4. Diagramas de Sequência")
    pdf.body(
        "Os diagramas a seguir representam os fluxos do sistema. As Figuras 4 a 17 cobrem autenticação, orçamento, "
        "relatórios, permissões, operações genéricas de cadastro, WhatsApp, financeiro e simulação. As Figuras 18 a 26 "
        "documentam o fluxo da oficina: ordem de serviço, estoque, mão de obra, recebimentos, compras e a geração de "
        "orçamento a partir da simulação.",
        first=True,
    )

    seq = [
        (V2 / "p24_0.png", "login",
         "O usuário informa e-mail e senha; o back-end valida as credenciais com BCrypt e devolve um token JWT que "
         "passa a acompanhar todas as requisições."),
        (DIAG / "fig05_cadastro_orcamento.png", "orcamento",
         "O orçamento pode ser iniciado em branco ou pré-preenchido por uma simulação. O sistema compara os preços das "
         "distribuidoras, escolhe o menor por material e calcula insumos, frete, lucro e valor total. Salvar a cotação "
         "não gera contas financeiras; elas nascem da ordem de serviço."),
        (V2 / "p26_0.png", "pdf",
         "A partir da cotação salva, o JasperReports monta o PDF do orçamento em memória e o devolve ao navegador."),
        (DIAG / "fig07_cadastro_funcionario.png", "funcionario",
         "O gerente cadastra os funcionários da oficina com valor/hora diurno e noturno. Funcionários com lançamentos "
         "de mão de obra não são excluídos, apenas desativados, preservando o histórico."),
        (DIAG / "fig08_relatorios.png", "relatorios",
         "O usuário escolhe o relatório; o back-end consulta os dados, preenche o modelo JasperReports e devolve o PDF."),
        (V2 / "p29_0.png", "permissoes",
         "Na página Configurações, aba Usuários e Permissões, o gerente ou administrador atribui perfis às pessoas."),
        (V2 / "p30_0.png", "listar", None),
        (V2 / "p31_0.png", "criar", None),
        (V2 / "p32_0.png", "editar", None),
        (V2 / "p33_0.png", "excluir", None),
        (V2 / "p34_0.png", "whatsapp",
         "O orçamento é enviado ao cliente pelo WPPConnect, e cada tentativa é registrada no log de envios."),
        (DIAG / "fig15_financeiro.png", "financeiro",
         "As contas são listadas com filtros e resumo; o usuário registra baixas totais ou parciais, cancela contas e "
         "envia cobranças por WhatsApp, individualmente ou em lote para as contas vencidas, com registro em histórico."),
        (DIAG / "fig16_simulacao.png", "simulacao",
         "A simulação calcula consumo, perdas, número de barras, sobras e custo estimado. O resultado pode ser salvo no "
         "histórico e marcado como modelo padronizado para reutilização."),
        (V2 / "p37_0.png", "wpp_conexao",
         "O sistema inicia a sessão no WPPConnect, obtém o QR Code para pareamento e verifica o status da conexão."),
        (DIAG / "fig22_gerar_os.png", "gerar_os",
         "A partir da cotação, o sistema monta um rascunho da OS. O usuário define status, observações, mão de obra e "
         "parcelamento; ao confirmar, a OS é criada e as contas a pagar e a receber são geradas por categoria."),
        (DIAG / "fig23_status_os.png", "status_os",
         "Quando a OS passa para EM_PRODUCAO ou CONCLUIDO, o estoque dos materiais da cotação é baixado uma única vez, "
         "controlado pelo indicador estoque_baixado."),
        (DIAG / "fig24_mao_obra.png", "mao_obra",
         "Cada lançamento informa funcionário, data de trabalho, horas e turno; o valor/hora noturno é aplicado quando "
         "o turno é noturno."),
        (DIAG / "fig28_pagamento_mo.png", "pagamento_mo",
         "O resumo do funcionário mostra as horas e valores do período. O gerente marca os lançamentos como pagos, que "
         "então ficam bloqueados para edição."),
        (DIAG / "fig30_recebimento_os.png", "recebimento_os",
         "Na tela da OS, o recebimento de cada categoria (material ou mão de obra) pode ser quitado ou estornado, "
         "atualizando as contas correspondentes."),
        (DIAG / "fig29_cancelar_os.png", "cancelar_os",
         "Ao cancelar a OS, as contas em aberto são canceladas e, se o usuário optar, o material já baixado retorna ao "
         "estoque."),
        (DIAG / "fig25_compra.png", "compra",
         "A compra registra fornecedor, nota e itens em kg, metros e barras; ao salvar, os saldos de estoque recebem as "
         "quantidades e cada entrada gera uma movimentação."),
        (DIAG / "fig26_cancelar_compra.png", "cancelar_compra",
         "O cancelamento da compra exige motivo, estorna as quantidades do estoque e registra a movimentação de ajuste."),
        (DIAG / "fig27_orcamento_simulacao.png", "orcamento_simulacao",
         "A partir de uma simulação ou modelo padronizado, o sistema abre a tela de criação de cotação com os materiais "
         "e quantidades já preenchidos."),
    ]
    for path, chave, texto in seq:
        pdf.add_page()
        if texto:
            pdf.body(texto, first=True)
        pdf.add_fig(path, FIGURAS[chave], max_h=170)

    pdf.add_page()
    pdf.h2("5.5. Diagrama de Distribuição e Componentes")
    pdf.body(
        "O diagrama de deploy mostra a distribuição física: navegador com o front-end React, servidor com a API Spring "
        "Boot, banco PostgreSQL, servidor SMTP e o WPPConnect em Docker.",
        first=True,
    )
    pdf.add_fig(DIAG / "fig18_deploy.png", FIGURAS["deploy"], max_h=110)
    pdf.add_page()
    pdf.body(
        "O diagrama de componentes apresenta as páginas do front-end, os serviços de integração e os módulos do "
        "back-end organizados em controllers, services e repositories.",
        first=True,
    )
    pdf.add_fig(DIAG / "fig19_componentes.png", FIGURAS["componentes"], max_h=170)

    # ===== CAP 6 =====
    pdf.add_page()
    pdf.h1("6. Projeto dos Dados")
    pdf.body(
        "Neste capítulo é apresentada a estrutura do banco de dados, ilustrada pelo DER atualizado e pelos dicionários "
        "de dados das tabelas principais, incluindo o núcleo de oficina, compras e estoque.",
        first=True,
    )
    pdf.h2("6.1. Diagrama Entidade-Relacionamento (DER)")
    pdf.body(
        "O DER apresenta as tabelas do banco PostgreSQL e suas chaves. A tabela cotacao_servico concentra os "
        "relacionamentos do fluxo comercial, enquanto material_disponivel concentra os relacionamentos de preços, "
        "estoque, compras e simulação.",
        first=True,
    )
    pdf.add_fig(DIAG / "fig20_der.png", FIGURAS["der"], max_h=200)
    pdf.body(
        "Relacionamentos centrais: pessoa N:1 cidade N:1 estado; pessoa 1:N permissao_pessoa N:1 permissao; "
        "cotacao_servico N:1 pessoa (cliente); cotacao_servico 1:N material, preco_material_cotacao, conta_financeira e "
        "whatsapp_envio_log; cotacao_servico N:N distribuidora (cotacao_distribuidora); cotacao_servico 1:1 "
        "ordem_servico; ordem_servico 1:N ordem_servico_mao_obra N:1 funcionario_oficina; conta_financeira 1:N "
        "cobranca_whatsapp_historico; material_disponivel 1:N material_preco, material_apelido, movimentacao_estoque, "
        "compra_lote_item e simulacao_item; material_disponivel 1:1 estoque_material; compra_lote 1:N compra_lote_item; "
        "simulacao 1:N simulacao_item."
    )

    pdf.h2("6.2. Dicionários de Dados")
    pdf.body(
        "Nas tabelas a seguir, a coluna Nulo indica se o campo aceita valor nulo e a coluna A/N indica se o conteúdo "
        "é alfanumérico (A) ou numérico/data (N).",
        first=True,
    )
    usable = pdf.w - pdf.l_margin - pdf.r_margin
    dw = [usable * x for x in (0.09, 0.25, 0.17, 0.07, 0.06, 0.36)]
    numero_tabela = iter(range(3, 100))

    def dict_table(nome, rows):
        pdf.table(
            [["PK/FK", "Nome", "Tipo", "Nulo", "A/N", "Descrição"]] + rows,
            col_w=dw,
            titulo=f"Tabela {next(numero_tabela)} – Dicionário de Dados da Tabela {nome}",
        )

    datas = [
        ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Data de criação do registro"],
        ["", "data_atualizacao", "TIMESTAMP", "SIM", "N", "Data da última alteração"],
    ]
    pk = ["PK", "id", "BIGINT", "NÃO", "N", "Identificador único"]

    dict_table("Pessoa", [
        pk,
        ["FK", "id_cidade", "BIGINT", "SIM", "N", "Cidade (cidade.id)"],
        ["", "nome", "VARCHAR(255)", "SIM", "A", "Nome completo"],
        ["", "cpf", "VARCHAR(255)", "SIM", "A", "CPF"],
        ["", "email", "VARCHAR(255)", "SIM", "A", "E-mail de acesso"],
        ["", "senha", "VARCHAR(255)", "SIM", "A", "Senha criptografada (BCrypt)"],
        ["", "codigo_recuperacao_senha", "VARCHAR(255)", "SIM", "A", "Código enviado por e-mail"],
        ["", "data_envia_codigo", "TIMESTAMP", "SIM", "N", "Envio do código de recuperação"],
        ["", "endereco", "VARCHAR(255)", "SIM", "A", "Endereço"],
        ["", "cep", "VARCHAR(255)", "SIM", "A", "CEP"],
    ] + datas)
    dict_table("Permissao", [
        pk,
        ["", "nome", "VARCHAR(255)", "SIM", "A", "Admin, Gerente ou Funcionario"],
    ] + datas)
    dict_table("Permissao_Pessoa", [
        pk,
        ["FK", "id_pessoa", "BIGINT", "SIM", "N", "Pessoa (pessoa.id)"],
        ["FK", "id_permissao", "BIGINT", "SIM", "N", "Perfil (permissao.id)"],
    ] + datas)
    dict_table("Cotacao_Servico", [
        pk,
        ["FK", "id_cliente", "BIGINT", "SIM", "N", "Cliente cadastrado (pessoa.id)"],
        ["", "nome", "VARCHAR(255)", "SIM", "A", "Nome do trabalho orçado"],
        ["", "cliente_nome", "VARCHAR(255)", "SIM", "A", "Nome do cliente"],
        ["", "telefone", "VARCHAR(255)", "SIM", "A", "Telefone do cliente"],
        ["", "endereco", "VARCHAR(255)", "SIM", "A", "Endereço do cliente"],
        ["", "quantidade_produto", "VARCHAR(255)", "SIM", "A", "Quantidade de peças"],
        ["", "preco_unitario", "DOUBLE", "SIM", "N", "Preço por unidade"],
        ["", "analise_escolha_json", "TEXT", "SIM", "A", "Comparativo de preços por distribuidora"],
        ["", "percentual_insumos", "NUMERIC(6,2)", "SIM", "N", "Percentual de insumos"],
        ["", "valor_frete", "NUMERIC(14,2)", "SIM", "N", "Frete"],
        ["", "total_custo_materiais", "NUMERIC(14,2)", "SIM", "N", "Custo dos materiais"],
        ["", "valor_insumos", "NUMERIC(14,2)", "SIM", "N", "Valor dos insumos"],
        ["", "percentual_lucro", "NUMERIC(6,2)", "SIM", "N", "Percentual de lucro"],
        ["", "valor_lucro", "NUMERIC(14,2)", "SIM", "N", "Valor do lucro"],
        ["", "valor_total_orcamento", "NUMERIC(14,2)", "SIM", "N", "Valor total do orçamento"],
        ["", "valor_pendente", "NUMERIC(15,2)", "SIM", "N", "Saldo pendente"],
        ["", "data_vencimento", "DATE", "SIM", "N", "Vencimento previsto"],
    ] + datas)
    dict_table("Material", [
        pk,
        ["FK", "id_cotacao", "BIGINT", "SIM", "N", "Cotação (cotacao_servico.id)"],
        ["FK", "id_material_disponivel", "BIGINT", "SIM", "N", "Material do catálogo"],
        ["", "quantidade", "INTEGER", "SIM", "N", "Quantidade"],
        ["", "metros", "NUMERIC(12,4)", "SIM", "N", "Metragem"],
        ["", "peso_kg", "NUMERIC(12,4)", "SIM", "N", "Peso em kg"],
    ] + datas)
    dict_table("Material_Disponivel", [
        pk,
        ["", "descricao", "VARCHAR(255)", "SIM", "A", "Descrição do material"],
        ["", "tamanho", "NUMERIC(12,4)", "SIM", "N", "Tamanho de referência"],
        ["", "unidade", "VARCHAR(20)", "SIM", "A", "BARRA, METRO, KG ou UNIDADE"],
        ["", "comprimento_barra_mm", "INTEGER", "SIM", "N", "Comprimento da barra (ex.: 6000)"],
        ["", "peso_kg_por_metro", "NUMERIC(12,4)", "SIM", "N", "Peso por metro"],
    ] + datas)
    dict_table("Material_Preco", [
        pk,
        ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "Material do catálogo"],
        ["FK", "id_distribuidora", "BIGINT", "NÃO", "N", "Distribuidora"],
        ["", "preco_unitario", "NUMERIC(12,2)", "NÃO", "N", "Preço unitário"],
        ["", "prazo_entrega_dias", "INTEGER", "SIM", "N", "Prazo de entrega"],
        ["", "observacao", "VARCHAR(255)", "SIM", "A", "Observação"],
        ["", "origem", "VARCHAR(20)", "NÃO", "A", "MANUAL, COTACAO ou IMPORTACAO"],
        ["", "data_inicio", "TIMESTAMP", "NÃO", "N", "Início da vigência"],
        ["", "data_fim", "TIMESTAMP", "SIM", "N", "Fim da vigência"],
    ])
    dict_table("Distribuidora", [
        pk,
        ["", "nome", "VARCHAR(255)", "SIM", "A", "Nome do fornecedor"],
    ] + datas)
    dict_table("Simulacao", [
        pk,
        ["", "nome_trabalho", "VARCHAR(120)", "SIM", "A", "Nome do trabalho ou modelo"],
        ["", "quantidade", "INTEGER", "NÃO", "N", "Quantidade de peças"],
        ["", "percentual_perda", "NUMERIC(6,2)", "NÃO", "N", "Perda estimada"],
        ["", "percentual_insumos", "NUMERIC(6,2)", "SIM", "N", "Percentual de insumos"],
        ["", "valor_frete", "NUMERIC(14,2)", "SIM", "N", "Frete"],
        ["", "total_custo_materiais", "NUMERIC(14,2)", "SIM", "N", "Custo dos materiais"],
        ["", "valor_insumos", "NUMERIC(14,2)", "SIM", "N", "Valor dos insumos"],
        ["", "total_custo_estimado", "NUMERIC(14,2)", "SIM", "N", "Custo total estimado"],
        ["", "padronizado", "BOOLEAN", "SIM", "N", "Indica modelo padronizado"],
        ["", "data_criacao", "TIMESTAMP", "NÃO", "N", "Data da simulação"],
    ])
    dict_table("Simulacao_Item", [
        pk,
        ["FK", "id_simulacao", "BIGINT", "NÃO", "N", "Simulação"],
        ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "Material do catálogo"],
        ["", "consumo_por_unidade", "NUMERIC(12,4)", "NÃO", "N", "Consumo por peça"],
        ["", "consumo_total", "NUMERIC(14,4)", "SIM", "N", "Consumo total"],
        ["", "total_com_perda", "NUMERIC(14,4)", "SIM", "N", "Consumo com perda"],
        ["", "quantidade_barras", "INTEGER", "SIM", "N", "Barras necessárias"],
        ["", "sobra_estimada", "NUMERIC(14,4)", "SIM", "N", "Sobra estimada"],
        ["", "preco_unitario_snapshot", "NUMERIC(12,2)", "SIM", "N", "Preço usado no cálculo"],
        ["", "distribuidora_nome_snapshot", "VARCHAR(200)", "SIM", "A", "Distribuidora do preço"],
        ["", "custo_estimado", "NUMERIC(14,2)", "SIM", "N", "Custo do item"],
    ])
    dict_table("Ordem_Servico", [
        pk,
        ["FK", "id_cotacao", "BIGINT", "SIM", "N", "Cotação de origem (única)"],
        ["", "status", "VARCHAR(30)", "NÃO", "A", "ABERTO, EM_PRODUCAO, CONCLUIDO ou CANCELADO"],
        ["", "estoque_baixado", "BOOLEAN", "SIM", "N", "Indica baixa de estoque já realizada"],
        ["", "nome", "VARCHAR(160)", "SIM", "A", "Nome do trabalho"],
        ["", "cliente_nome", "VARCHAR(160)", "SIM", "A", "Cliente"],
        ["", "telefone", "VARCHAR(40)", "SIM", "A", "Telefone"],
        ["", "endereco", "VARCHAR(300)", "SIM", "A", "Endereço de entrega"],
        ["", "quantidade_produto", "INTEGER", "SIM", "N", "Quantidade de peças"],
        ["", "observacoes", "VARCHAR(1000)", "SIM", "A", "Observações da produção"],
    ] + datas)
    dict_table("Ordem_Servico_Mao_Obra", [
        pk,
        ["FK", "id_ordem_servico", "BIGINT", "NÃO", "N", "Ordem de serviço"],
        ["FK", "id_funcionario", "BIGINT", "SIM", "N", "Funcionário da oficina"],
        ["", "data_trabalho", "DATE", "SIM", "N", "Dia trabalhado"],
        ["", "noturno", "BOOLEAN", "SIM", "N", "Turno noturno"],
        ["", "horas", "NUMERIC(10,2)", "NÃO", "N", "Horas trabalhadas"],
        ["", "valor_hora", "NUMERIC(12,2)", "NÃO", "N", "Valor/hora aplicado"],
        ["", "valor_total", "NUMERIC(14,2)", "NÃO", "N", "Horas × valor/hora"],
        ["", "observacao", "VARCHAR(300)", "SIM", "A", "Observação"],
        ["", "pago_funcionario", "BOOLEAN", "SIM", "N", "Pago ao funcionário"],
        ["", "data_pagamento_funcionario", "DATE", "SIM", "N", "Data do pagamento"],
        ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Data do lançamento"],
    ])
    dict_table("Funcionario_Oficina", [
        pk,
        ["", "nome", "VARCHAR(120)", "NÃO", "A", "Nome"],
        ["", "telefone", "VARCHAR(30)", "SIM", "A", "Telefone"],
        ["", "cargo", "VARCHAR(60)", "SIM", "A", "Cargo"],
        ["", "valor_hora", "NUMERIC(12,2)", "NÃO", "N", "Valor/hora diurno"],
        ["", "valor_hora_noturno", "NUMERIC(12,2)", "SIM", "N", "Valor/hora noturno"],
        ["", "ativo", "BOOLEAN", "NÃO", "N", "Funcionário ativo"],
    ] + datas)
    dict_table("Conta_Financeira", [
        pk,
        ["FK", "id_cotacao", "BIGINT", "NÃO", "N", "Cotação/OS de origem"],
        ["FK", "id_distribuidora", "BIGINT", "SIM", "N", "Fornecedor (contas a pagar)"],
        ["", "tipo", "VARCHAR(20)", "NÃO", "A", "PAGAR ou RECEBER"],
        ["", "status", "VARCHAR(20)", "NÃO", "A", "PENDENTE, PARCIAL, PAGA, VENCIDA ou CANCELADA"],
        ["", "categoria", "VARCHAR(20)", "SIM", "A", "MATERIAL, MAO_DE_OBRA, INSUMOS ou FRETE"],
        ["", "forma_pagamento", "VARCHAR(30)", "NÃO", "A", "PIX, DINHEIRO, BOLETO, CARTAO_CREDITO etc."],
        ["", "valor", "NUMERIC(14,2)", "NÃO", "N", "Valor da conta ou parcela"],
        ["", "valor_pago", "NUMERIC(14,2)", "SIM", "N", "Valor já pago"],
        ["", "descricao", "VARCHAR(500)", "SIM", "A", "Descrição"],
        ["", "cliente_nome_snapshot", "VARCHAR(200)", "SIM", "A", "Nome do cliente na geração"],
        ["", "telefone_cliente_snapshot", "VARCHAR(50)", "SIM", "A", "Telefone do cliente na geração"],
        ["", "data_vencimento", "DATE", "SIM", "N", "Vencimento"],
        ["", "data_pagamento", "TIMESTAMP", "SIM", "N", "Data da baixa"],
        ["", "numero_parcela", "INTEGER", "SIM", "N", "Número da parcela"],
        ["", "total_parcelas", "INTEGER", "SIM", "N", "Total de parcelas (até 24)"],
        ["", "grupo_parcela", "VARCHAR(36)", "SIM", "A", "UUID que agrupa as parcelas"],
    ] + datas)
    dict_table("Cobranca_Whatsapp_Historico", [
        pk,
        ["FK", "id_conta", "BIGINT", "NÃO", "N", "Conta cobrada"],
        ["", "mensagem", "TEXT", "NÃO", "A", "Mensagem enviada"],
        ["", "telefone", "VARCHAR(30)", "SIM", "A", "Telefone de destino"],
        ["", "link_whatsapp", "VARCHAR(2000)", "SIM", "A", "Link gerado para o WhatsApp"],
        ["", "tipo", "VARCHAR(30)", "NÃO", "A", "PREVIEW, ABERTURA_WHATSAPP ou LOTE_VENCIDAS"],
        ["", "data_disparo", "TIMESTAMP", "NÃO", "N", "Data da cobrança"],
    ])
    dict_table("Compra_Lote", [
        pk,
        ["FK", "id_distribuidora", "BIGINT", "SIM", "N", "Fornecedor"],
        ["", "data_compra", "DATE", "NÃO", "N", "Data da compra"],
        ["", "numero_nota", "VARCHAR(60)", "SIM", "A", "Número da nota fiscal"],
        ["", "observacao", "VARCHAR(500)", "SIM", "A", "Observação"],
        ["", "status", "VARCHAR(20)", "NÃO", "A", "ATIVA ou CANCELADA"],
        ["", "motivo_cancelamento", "VARCHAR(500)", "SIM", "A", "Motivo do cancelamento"],
        ["", "data_cancelamento", "TIMESTAMP", "SIM", "N", "Data do cancelamento"],
        ["", "valor_total", "NUMERIC(14,2)", "SIM", "N", "Valor total"],
        ["", "data_criacao", "TIMESTAMP", "SIM", "N", "Data de registro"],
    ])
    dict_table("Compra_Lote_Item", [
        pk,
        ["FK", "id_compra_lote", "BIGINT", "NÃO", "N", "Compra"],
        ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "Material do catálogo"],
        ["", "quantidade_kg", "NUMERIC(14,4)", "SIM", "N", "Quantidade em kg"],
        ["", "metros", "NUMERIC(14,4)", "SIM", "N", "Metragem"],
        ["", "barras", "INTEGER", "SIM", "N", "Número de barras"],
        ["", "valor_kg", "NUMERIC(14,4)", "SIM", "N", "Preço por kg"],
        ["", "valor_total", "NUMERIC(14,2)", "SIM", "N", "Valor do item"],
    ])
    dict_table("Estoque_Material", [
        pk,
        ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "Material (único)"],
        ["", "quantidade_kg", "NUMERIC(14,4)", "NÃO", "N", "Saldo em kg"],
        ["", "metros", "NUMERIC(14,4)", "NÃO", "N", "Saldo em metros"],
        ["", "barras", "INTEGER", "NÃO", "N", "Saldo em barras"],
        ["", "data_atualizacao", "TIMESTAMP", "SIM", "N", "Última movimentação"],
    ])
    dict_table("Movimentacao_Estoque", [
        pk,
        ["FK", "id_material_disponivel", "BIGINT", "NÃO", "N", "Material do catálogo"],
        ["", "tipo", "VARCHAR(30)", "NÃO", "A", "ENTRADA_COMPRA, SAIDA_OS ou AJUSTE"],
        ["", "quantidade_kg", "NUMERIC(14,4)", "SIM", "N", "Quantidade em kg"],
        ["", "metros", "NUMERIC(14,4)", "SIM", "N", "Metragem"],
        ["", "barras", "INTEGER", "SIM", "N", "Barras"],
        ["", "referencia", "VARCHAR(300)", "SIM", "A", "Origem (compra ou OS)"],
        ["", "data_movimentacao", "TIMESTAMP", "NÃO", "N", "Data da movimentação"],
    ])
    dict_table("Configuracao_Whatsapp", [
        pk,
        ["", "mensagem_orcamento", "TEXT", "NÃO", "A", "Modelo da mensagem de orçamento"],
        ["", "mensagem_cobranca", "TEXT", "NÃO", "A", "Modelo da mensagem de cobrança"],
        ["", "url_wppconnect", "VARCHAR(255)", "SIM", "A", "Endereço do WPPConnect"],
        ["", "token_wppconnect", "TEXT", "SIM", "A", "Token de acesso ao WPPConnect"],
        ["", "nome_sessao", "VARCHAR(100)", "SIM", "A", "Nome da sessão"],
    ])
    dict_table("Whatsapp_Envio_Log", [
        pk,
        ["FK", "cotacao_id", "BIGINT", "NÃO", "N", "Cotação enviada"],
        ["", "status", "VARCHAR(20)", "NÃO", "A", "Resultado do envio"],
        ["", "telefone_destino", "VARCHAR(20)", "SIM", "A", "Telefone de destino"],
        ["", "mensagem_enviada", "TEXT", "SIM", "A", "Mensagem enviada"],
        ["", "data_envio", "TIMESTAMP", "NÃO", "N", "Data do envio"],
        ["", "erro_detalhe", "TEXT", "SIM", "A", "Detalhe do erro"],
    ])

    # ===== CAP 7 =====
    pdf.add_page()
    pdf.h1("7. Projeto Arquitetural")
    pdf.body(
        "Este capítulo apresenta a organização da navegação do sistema. Após a autenticação, o usuário acessa os "
        "módulos pelo menu lateral, agrupados em Cadastros, Comercial, Produção, Estoque, Financeiro e Configurações. "
        "Os itens exibidos dependem do perfil do usuário, conforme descrito no Capítulo 8.",
        first=True,
    )
    pdf.add_fig(DIAG / "fig21_arquitetura.png", FIGURAS["arquitetura"], max_h=200)

    # ===== CAP 8 =====
    pdf.add_page()
    pdf.h1("8. Projeto Procedimental")
    pdf.body(
        "Este capítulo descreve os procedimentos adotados para garantir a integridade das informações e a segurança "
        "dos dados armazenados no banco de dados utilizado pelo sistema da HSA Serralheria.",
        first=True,
    )
    pdf.h2("8.1. Níveis de Acesso")
    pdf.body(
        "O controle de acesso é realizado por meio de credenciais individuais (e-mail + senha) com autenticação JWT. "
        "As permissões são atribuídas na página Configurações, aba Usuários e Permissões, e verificadas via Spring "
        "Security no back-end e RoleRoute no front-end.",
        first=True,
    )
    pdf.body(
        "Acesso Administrador (Admin) e Gerente: os dois perfis possuem as mesmas permissões e acesso total ao "
        "sistema — cadastros, cotações, simulação, ordens de serviço, funcionários da oficina, compras, estoque, "
        "financeiro, cobrança, gestão de usuários e permissões e configuração do WhatsApp."
    )
    pdf.body(
        "Acesso Funcionário (Funcionario): página inicial, cotações, simulação de produção e ordens de serviço. Não "
        "acessa cadastros, funcionários da oficina, compras, estoque, financeiro nem configurações."
    )
    pdf.table(
        [
            ["Módulo", "Funcionario", "Gerente", "Admin"],
            ["Início / Cotações / Simulação / Ordens de Serviço", "Sim", "Sim", "Sim"],
            ["Cadastros (estado, cidade, materiais, distribuidoras)", "Não", "Sim", "Sim"],
            ["Funcionários da oficina e pagamento de mão de obra", "Não", "Sim", "Sim"],
            ["Compras de material / Estoque", "Não", "Sim", "Sim"],
            ["Financeiro / Cobrança WhatsApp", "Não", "Sim", "Sim"],
            ["Configurações (usuários, permissões e WhatsApp)", "Não", "Sim", "Sim"],
        ],
        col_w=[85, 25, 25, 25],
        titulo=f"Tabela {3 + len(TABELAS_DICIONARIO)} – Matriz de Níveis de Acesso por Módulo",
    )
    pdf.body(
        "A implementação utiliza JWT Bearer Token com validade de 15 minutos (ou 1 dia com a opção “Lembrar de mim”), "
        "BCryptPasswordEncoder para senhas e @PreAuthorize nos endpoints sensíveis, como os de usuários e WhatsApp."
    )

    # ===== CAP 9 =====
    pdf.add_page()
    pdf.h1("9. Conclusão")
    pdf.body(
        "O desenvolvimento do sistema para a HSA Serralheria representou uma solução eficaz e personalizada para "
        "atender às necessidades de gestão de orçamentos, controle de materiais, produção na oficina, cadastro de "
        "clientes, geração de relatórios e segurança da informação. Através da aplicação de boas práticas de engenharia "
        "de software, utilizando Java com Spring Boot no back-end e React no front-end, foi possível construir uma "
        "plataforma moderna, escalável e de fácil manutenção.",
        first=True,
    )
    pdf.body(
        "O sistema evoluiu além do escopo inicial de orçamentos, incorporando simulação de produção com modelos "
        "padronizados convertíveis em orçamento; ordens de serviço com baixa automática de estoque; lançamento de mão "
        "de obra diurna e noturna com controle de pagamento aos funcionários; geração de contas a pagar e a receber por "
        "categoria a partir da OS, com parcelamento, quitação e estorno; compra de material em lote com entrada e "
        "estorno de estoque; importação de planilhas de preços; cobrança e envio de orçamentos via WhatsApp "
        "(WPPConnect); e rotina agendada para marcar contas vencidas."
    )
    pdf.body(
        "O sistema também incorporou autenticação via JWT e controle de permissões por perfil (Admin, Gerente, "
        "Funcionario). Os módulos foram organizados de forma clara e funcional, com 26 controllers REST, 36 services "
        "de negócio, 29 repositories e 30 entidades JPA, persistidas em PostgreSQL."
    )
    pdf.body(
        "Durante análise, modelagem, desenvolvimento e documentação, aplicaram-se conceitos de banco de dados "
        "relacional, arquitetura REST, orientação a objetos, integração de sistemas e modelagem UML, fortalecendo o "
        "aprendizado acadêmico com a vivência em um projeto real."
    )
    pdf.body(
        "Conclui-se que o sistema atende às demandas da empresa e oferece base para expansões futuras, contribuindo "
        "para a digitalização dos processos internos e para o aumento da produtividade da HSA Serralheria."
    )

    # ===== REFS =====
    pdf.add_page()
    pdf.h1("Referências")
    acesso = "Acesso em: 27 set. 2026."
    refs = [
        f"APACHE SOFTWARE FOUNDATION. Apache Maven. Disponível em: https://maven.apache.org/. {acesso}",
        f"APACHE SOFTWARE FOUNDATION. Apache POI: the Java API for Microsoft Documents. Disponível em: https://poi.apache.org/. {acesso}",
        f"AXIOS. Axios Documentation. Disponível em: https://axios-http.com/. {acesso}",
        "BOOCH, Grady; RUMBAUGH, James; JACOBSON, Ivar. UML: guia do usuário. 2. ed. Rio de Janeiro: Elsevier, 2006.",
        "BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: "
        f"Presidência da República, 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. {acesso}",
        f"CHART.JS. Chart.js Documentation. Disponível em: https://www.chartjs.org/docs/. {acesso}",
        f"DOCKER INC. Docker Documentation. Disponível em: https://docs.docker.com/. {acesso}",
        f"ECMA INTERNATIONAL. ECMAScript® Language Specification. Disponível em: https://tc39.es/ecma262/. {acesso}",
        f"HIBERNATE. Hibernate ORM Documentation. Disponível em: https://hibernate.org/orm/documentation/. {acesso}",
        "IBGE. Comissão Nacional de Classificação (CONCLA). Classificação Nacional de Atividades Econômicas – CNAE 2.3. "
        f"Disponível em: https://concla.ibge.gov.br/. {acesso}",
        f"JASPERSOFT. JasperReports Library. Disponível em: https://community.jaspersoft.com/project/jasperreports-library. {acesso}",
        "JONES, M.; BRADLEY, J.; SAKIMURA, N. RFC 7519: JSON Web Token (JWT). Internet Engineering Task Force (IETF), "
        f"2015. Disponível em: https://www.rfc-editor.org/rfc/rfc7519. {acesso}",
        f"META PLATFORMS INC. React: the library for web and native user interfaces. Disponível em: https://react.dev/. {acesso}",
        f"MICROSOFT CORPORATION. Visual Studio Code. Disponível em: https://code.visualstudio.com/. {acesso}",
        f"MUI. Material UI. Disponível em: https://mui.com/material-ui/. {acesso}",
        f"OPENJS FOUNDATION. Node.js Documentation. Disponível em: https://nodejs.org/en/docs/. {acesso}",
        f"ORACLE. Java Platform, Standard Edition. Disponível em: https://www.oracle.com/java/technologies/javase/. {acesso}",
        f"PLANTUML. PlantUML: open-source tool to draw UML diagrams. Disponível em: https://plantuml.com/. {acesso}",
        f"POSTGRESQL GLOBAL DEVELOPMENT GROUP. PostgreSQL Documentation. Disponível em: https://www.postgresql.org/docs/. {acesso}",
        "PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.",
        f"PRIMETEK. PrimeReact. Disponível em: https://primereact.org/. {acesso}",
        f"PROJECT LOMBOK. Project Lombok. Disponível em: https://projectlombok.org/. {acesso}",
        "SOMMERVILLE, Ian. Engenharia de software. 9. ed. São Paulo: Pearson Prentice Hall, 2011.",
        f"SPRING. Spring Boot Reference Documentation. Disponível em: https://docs.spring.io/spring-boot/. {acesso}",
        f"SPRING. Spring Security Reference. Disponível em: https://docs.spring.io/spring-security/reference/. {acesso}",
        f"TAILWIND LABS. Tailwind CSS Documentation. Disponível em: https://tailwindcss.com/docs. {acesso}",
        f"WPPCONNECT TEAM. WPPConnect Server. Disponível em: https://github.com/wppconnect-team/wppconnect-server. {acesso}",
    ]
    for r in refs:
        pdf.reset_x()
        pdf.set_font("TNR", "", 11)
        pdf.multi_cell(0, 6, r, align="J")
        pdf.ln(2)

    pdf.output(str(OUT_PDF))
    OUT_COD.parent.mkdir(parents=True, exist_ok=True)
    import shutil
    shutil.copy2(OUT_PDF, OUT_COD)
    print("PDF:", OUT_PDF, OUT_PDF.stat().st_size)
    print("COD:", OUT_COD, OUT_COD.stat().st_size)
    print("pages:", pdf.page_no())


if __name__ == "__main__":
    build()
