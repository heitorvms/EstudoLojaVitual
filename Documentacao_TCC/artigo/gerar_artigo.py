# -*- coding: utf-8 -*-
"""Gera o artigo científico resumido do sistema HSA Serralheria (modelo SBC/Unipar)."""
import shutil
from pathlib import Path

from fpdf import FPDF
from fpdf.fonts import FontFace
from PIL import Image

ROOT = Path(__file__).resolve().parent
PRINTS = ROOT / "prints"
DIAG = ROOT.parent / "diagramas"
FONTS = ROOT.parent / "fonts"
WIN_FONTS = Path(r"C:/Windows/Fonts")
OUT_PDF = ROOT / "HSA_Artigo_Cientifico_Resumido.pdf"
OUT_COD = Path(r"c:/Users/Heitor/OneDrive/Área de Trabalho/cod_tcc") / OUT_PDF.name

MT, ML, MB, MR = 35, 30, 25, 30
PT = 0.3528
LINHA = 1.15
ACESSO = "Acesso em: 27/09/2026."

AUTORES = "Heitor Venâncio Marins da Silva, Jaime William Dias"
ENDERECO = ["Universidade Paranaense (Unipar) – Unidade de Paranavaí", "Paranavaí – PR – Brasil"]
EMAILS = ""

SEM_MENU = (0.23, 0, 0.985, 1)
SEM_MENU_RODAPE = (0.23, 0, 0.985, 0.78)
INTEIRA = (0, 0, 1, 1)


def recortar(caminho, corte):
    imagem = Image.open(caminho).convert("RGB")
    esquerda, topo, direita, base = corte
    return imagem.crop((
        round(imagem.width * esquerda), round(imagem.height * topo),
        round(imagem.width * direita), round(imagem.height * base),
    ))


class Artigo(FPDF):
    def __init__(self):
        super().__init__(format="A4", unit="mm")
        self.add_font("TNR", "", str(FONTS / "times.ttf"))
        self.add_font("TNR", "B", str(FONTS / "timesbd.ttf"))
        self.add_font("CourierNew", "", str(WIN_FONTS / "cour.ttf"))
        self.set_margins(ML, MT, MR)
        self.set_auto_page_break(auto=True, margin=MB)
        self.figura = 0
        self.tabela = 0
        self._primeiro = True

    def multi_cell(self, *args, **kwargs):
        kwargs.setdefault("new_x", "LMARGIN")
        kwargs.setdefault("new_y", "NEXT")
        return super().multi_cell(*args, **kwargs)

    @property
    def largura(self):
        return self.w - ML - MR

    def espaco(self, pontos):
        self.ln(pontos * PT)

    def garantir(self, altura_mm):
        if self.get_y() + altura_mm > self.h - MB:
            self.add_page()

    def titulo_artigo(self, texto):
        self.set_font("TNR", "B", 16)
        self.multi_cell(0, 16 * PT * LINHA, texto, align="C")
        self.espaco(12)

    def cabecalho_autores(self):
        self.set_font("TNR", "B", 12)
        self.multi_cell(0, 12 * PT * LINHA, AUTORES, align="C")
        self.espaco(6)
        self.set_font("TNR", "", 12)
        for linha in ENDERECO:
            self.multi_cell(0, 12 * PT * LINHA, linha, align="C")
        if EMAILS:
            self.set_font("CourierNew", "", 10)
            self.multi_cell(0, 10 * PT * LINHA, EMAILS, align="C")
        self.espaco(18)

    def resumo(self, texto):
        recuo = 8
        self.set_left_margin(ML + recuo)
        self.set_right_margin(MR + recuo)
        self.set_x(ML + recuo)
        self.set_font("TNR", "", 12)
        self.multi_cell(0, 12 * PT * LINHA, f"**Resumo.** {texto}", align="J", markdown=True)
        self.set_left_margin(ML)
        self.set_right_margin(MR)
        self.espaco(12)

    def secao(self, texto):
        self.garantir(25)
        self.espaco(12)
        self.set_x(ML)
        self.set_font("TNR", "B", 12)
        self.multi_cell(0, 12 * PT * LINHA, texto, align="L")
        self._primeiro = True

    def paragrafo(self, texto):
        self.espaco(6)
        self.set_x(ML)
        self.set_font("TNR", "", 12)
        recuo = 0 if self._primeiro else 12.5
        with self.text_columns(text_align="J", line_height=LINHA) as colunas:
            with colunas.paragraph(first_line_indent=recuo) as p:
                p.write(texto)
        self._primeiro = False

    def legenda(self, texto, x, largura):
        self.set_xy(x, self.get_y() + 1.5)
        self.set_font("TNR", "B", 10)
        self.multi_cell(largura, 10 * PT * LINHA, texto, align="C")

    def figuras(self, itens, largura_total=None, corte=SEM_MENU):
        """itens: lista de (caminho, legenda[, corte]). Uma ou duas imagens lado a lado."""
        gap = 6
        largura_total = largura_total or self.largura
        largura = (largura_total - gap * (len(itens) - 1)) / len(itens)
        imagens = [recortar(item[0], item[2] if len(item) > 2 else corte) for item in itens]
        alturas = [largura * img.height / img.width for img in imagens]
        self.garantir(max(alturas) + 16)
        self.espaco(6)
        x0 = ML + (self.largura - largura_total) / 2
        y0 = self.get_y()
        y_fim = y0
        for i, (imagem, (_, texto, *_)) in enumerate(zip(imagens, itens)):
            x = x0 + i * (largura + gap)
            self.image(imagem, x=x, y=y0, w=largura)
            self.set_draw_color(180, 180, 180)
            self.rect(x, y0, largura, alturas[i])
            self.figura += 1
            self.set_y(y0 + max(alturas))
            self.legenda(f"Figura {self.figura}: {texto}", x, largura)
            y_fim = max(y_fim, self.get_y())
        self.set_y(y_fim)
        self._primeiro = False

    def tabela_dados(self, titulo, linhas, larguras):
        self.garantir(60)
        self.espaco(6)
        self.tabela += 1
        self.set_x(ML)
        self.set_font("TNR", "B", 10)
        self.multi_cell(0, 10 * PT * LINHA, f"Tabela {self.tabela}. {titulo}", align="C")
        self.ln(1)
        self.set_font("TNR", "", 10)
        with self.table(
            col_widths=larguras,
            width=self.largura,
            line_height=10 * PT * 1.3,
            borders_layout="HORIZONTAL_LINES",
            headings_style=FontFace(emphasis="BOLD"),
            text_align="LEFT",
            padding=1,
        ) as tabela:
            for linha in linhas:
                row = tabela.row()
                for celula in linha:
                    row.cell(celula)
        self._primeiro = False

    def referencias(self, itens):
        self.secao("Referências")
        self.set_font("TNR", "", 12)
        for ref in itens:
            self.espaco(6)
            self.set_x(ML)
            self.multi_cell(0, 12 * PT * LINHA, ref, align="L")


RESUMO = (
    "Pequenas serralherias ainda elaboram orçamentos de forma manual, o que gera lentidão, erros de cálculo e perda "
    "de histórico. Este artigo apresenta o HSA Serralheria, sistema web que automatiza cotações com escolha da "
    "distribuidora de menor preço, simulação de produção, ordens de serviço com baixa de estoque e mão de obra, "
    "compras de material e gestão financeira com cobrança via WhatsApp. O desenvolvimento seguiu levantamento de "
    "requisitos junto à empresa, modelagem UML e implementação com Java, Spring Boot, React e PostgreSQL. Conclui-se "
    "que a solução centraliza o processo comercial e produtivo, reduzindo erros e retrabalho."
)

TECNOLOGIAS = [
    ["Camada", "Tecnologia", "Finalidade"],
    ["Back-end", "Java 21, Spring Boot 3.3.4, Spring Data JPA", "API REST, regras de negócio e persistência"],
    ["Segurança", "Spring Security, JWT (jjwt 0.12.6), BCrypt", "Autenticação e controle de acesso por perfil"],
    ["Banco de dados", "PostgreSQL", "Armazenamento relacional dos dados"],
    ["Front-end", "React 19, PrimeReact 10, Material UI 6, Axios", "Interface web e consumo da API"],
    ["Relatórios", "JasperReports 7.0.3", "Geração do orçamento em PDF"],
    ["Planilhas", "Apache POI 5.3.0", "Importação de preços das distribuidoras"],
    ["Mensageria", "WPPConnect Server (Docker)", "Envio de orçamentos e cobranças via WhatsApp"],
    ["Ferramentas", "VS Code, Postman, Maven, NPM, Git, PlantUML", "Codificação, testes de API, build e modelagem"],
]

REFERENCIAS = [
    "Booch, G. et al. (2006) UML: guia do usuário. 2. ed. Rio de Janeiro: Elsevier.",
    f"Brasil (2018) Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). "
    f"Disponível em: <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm>. {ACESSO}",
    f"Jones, M. et al. (2015) RFC 7519: JSON Web Token (JWT). Internet Engineering Task Force (IETF). "
    f"Disponível em: <https://www.rfc-editor.org/rfc/rfc7519>. {ACESSO}",
    f"Meta Platforms (2026) React: the library for web and native user interfaces. Disponível em: "
    f"<https://react.dev/>. {ACESSO}",
    f"PostgreSQL Global Development Group (2026) PostgreSQL Documentation. Disponível em: "
    f"<https://www.postgresql.org/docs/>. {ACESSO}",
    "Pressman, R. S. e Maxim, B. R. (2016) Engenharia de software: uma abordagem profissional. 8. ed. "
    "Porto Alegre: AMGH.",
    f"PrimeTek (2026) PrimeReact. Disponível em: <https://primereact.org/>. {ACESSO}",
    "Sommerville, I. (2011) Engenharia de software. 9. ed. São Paulo: Pearson Prentice Hall.",
    f"Spring (2026a) Spring Boot Reference Documentation. Disponível em: <https://docs.spring.io/spring-boot/>. {ACESSO}",
    f"Spring (2026b) Spring Security Reference. Disponível em: <https://docs.spring.io/spring-security/reference/>. "
    f"{ACESSO}",
    f"TIBCO Jaspersoft (2026) JasperReports Library. Disponível em: "
    f"<https://community.jaspersoft.com/project/jasperreports-library>. {ACESSO}",
    f"WPPConnect Team (2026) WPPConnect Server. Disponível em: <https://github.com/wppconnect-team/wppconnect-server>. "
    f"{ACESSO}",
]


def gerar():
    pdf = Artigo()
    pdf.add_page()
    pdf.titulo_artigo("HSA SERRALHERIA: SISTEMA WEB PARA ORÇAMENTOS, ORDENS DE SERVIÇO E GESTÃO DE ESTOQUE")
    pdf.cabecalho_autores()
    pdf.resumo(RESUMO)

    pdf.secao("1. Introdução")
    pdf.paragrafo(
        "A HSA Serralheria é uma empresa do ramo metalúrgico que fabrica e comercializa estruturas metálicas, portões e "
        "cadeiras produzidas em escala, além de prestar serviços personalizados de serralheria. Nesse segmento, cada "
        "orçamento depende de medidas, quantidades de barras e chapas, insumos, frete e mão de obra, e os preços dos "
        "materiais variam com frequência entre as distribuidoras."
    )
    pdf.paragrafo(
        "Antes do sistema, os orçamentos eram calculados manualmente, com apoio de anotações em papel e planilhas "
        "isoladas. Esse processo tornava a resposta ao cliente lenta, favorecia erros de cálculo, dificultava a "
        "comparação entre fornecedores e não mantinha histórico de preços, produção, estoque e pagamentos."
    )
    pdf.paragrafo(
        "O objetivo deste trabalho é apresentar o HSA Serralheria, um sistema web que integra em um único ambiente o "
        "processo comercial e produtivo da empresa: da cotação e da simulação de produção até a ordem de serviço, o "
        "controle de estoque, a mão de obra da oficina e o financeiro, com envio de orçamentos e cobranças via WhatsApp."
    )

    pdf.secao("2. Metodologia Utilizada")
    pdf.paragrafo(
        "O trabalho foi conduzido como um estudo aplicado, desenvolvido em quatro etapas: levantamento de requisitos, "
        "modelagem, implementação e testes, seguindo boas práticas da engenharia de software [Sommerville, 2011]."
    )
    pdf.paragrafo(
        "No levantamento de requisitos, foram realizadas entrevistas com o proprietário e a observação do processo de "
        "orçamento e produção da oficina. As necessidades identificadas foram organizadas em funcionalidades e "
        "priorizadas conforme o impacto no dia a dia da empresa, começando pelo cálculo da cotação."
    )
    pdf.paragrafo(
        "Na modelagem, utilizou-se a UML [Booch et al., 2006], com diagramas de casos de uso, classes, sequência, "
        "componentes e implantação, além do diagrama de entidade e relacionamento, gerados com a ferramenta PlantUML."
    )
    pdf.paragrafo(
        "A implementação seguiu o modelo incremental [Pressman e Maxim, 2016]: cada módulo foi desenvolvido, testado "
        "na API com o Postman e validado na interface antes de iniciar o seguinte, com o código versionado em Git."
    )

    pdf.secao("3. Desenvolvimento")
    pdf.paragrafo(
        "Esta seção apresenta as tecnologias adotadas, a arquitetura do sistema e o fluxo principal da solução."
    )

    pdf.secao("3.1. Tecnologias Utilizadas")
    pdf.paragrafo(
        "Foram escolhidas tecnologias de código aberto, amplamente utilizadas no mercado e com documentação ativa, o "
        "que reduz custos de licenciamento e facilita a manutenção. A Tabela 1 resume as tecnologias por camada."
    )
    pdf.tabela_dados("Tecnologias utilizadas no sistema", TECNOLOGIAS, (22, 44, 44))

    pdf.secao("3.2. Arquitetura do Sistema")
    pdf.paragrafo(
        "O sistema segue a arquitetura cliente-servidor com back-end e front-end desacoplados, comunicando-se por uma "
        "API REST no formato JSON. O front-end em React [Meta Platforms, 2026] é executado no navegador e envia, em cada "
        "requisição, um token JWT [Jones et al., 2015] gerado no login. O back-end em Spring Boot [Spring, 2026a] é "
        "organizado nas camadas controller, service e repository, e persiste os dados no PostgreSQL "
        "[PostgreSQL Global Development Group, 2026] por meio do Spring Data JPA."
    )
    pdf.paragrafo(
        "Os orçamentos em PDF são gerados em memória com o JasperReports [TIBCO Jaspersoft, 2026]. A integração com o "
        "WhatsApp é feita pelo WPPConnect Server [WPPConnect Team, 2026], executado em um contêiner Docker, e a "
        "recuperação de senha utiliza um servidor SMTP. A Figura 1 apresenta o diagrama de implantação."
    )
    pdf.figuras([(DIAG / "fig18_deploy.png", "Diagrama de implantação do sistema")], largura_total=125, corte=INTEIRA)
    pdf.paragrafo(
        "A segurança é garantida pelo Spring Security [Spring, 2026b]: as senhas são armazenadas com criptografia "
        "BCrypt e cada rota é liberada conforme o perfil do usuário (Admin, Gerente ou Funcionario). Os dados pessoais "
        "são tratados apenas para a finalidade comercial da empresa, em conformidade com a LGPD [Brasil, 2018]."
    )

    pdf.secao("3.3. Fluxo Principal do Sistema")
    pdf.paragrafo(
        "O sistema é organizado nos módulos Cadastros, Comercial, Produção, Estoque, Financeiro e Configurações. O "
        "fluxo principal parte da cotação, que pode ser criada diretamente ou a partir de uma simulação de produção; a "
        "cotação gera a ordem de serviço, que baixa o estoque, recebe os lançamentos de mão de obra e origina as contas "
        "a pagar e a receber."
    )

    pdf.secao("3.3.1. Cotação")
    pdf.paragrafo(
        "Na cotação, o usuário informa o cliente, o serviço e os materiais com suas quantidades. O sistema consulta os "
        "preços cadastrados de cada distribuidora, compara os valores e indica a de menor custo, somando insumos, frete "
        "e margem de lucro para compor o valor final. O orçamento pode ser emitido em PDF e enviado ao cliente pelo "
        "WhatsApp, e os preços podem ser atualizados pela importação de planilhas das distribuidoras."
    )
    pdf.figuras([
        (PRINTS / "04_cotacao_detalhe.png", "Detalhe da cotação por distribuidora"),
        (PRINTS / "05_cotacao_custos.png", "Composição de custos da cotação"),
    ])

    pdf.secao("3.3.2. Ordem de Serviço e Estoque")
    pdf.paragrafo(
        "A ordem de serviço é gerada a partir da cotação e acompanha a produção pelos status aberto, em produção, "
        "concluído e cancelado. Ao entrar em produção, os materiais são baixados automaticamente do estoque, que é "
        "reabastecido pelas compras de material em lote. As horas trabalhadas são lançadas por funcionário, com valor "
        "diurno e noturno, e o gerente controla o pagamento de cada lançamento."
    )

    pdf.secao("3.3.3. Financeiro")
    pdf.paragrafo(
        "A partir da ordem de serviço são geradas as contas a receber do cliente e as contas a pagar por categoria "
        "(material, mão de obra, insumos e frete). Uma rotina diária marca as contas vencidas, e as cobranças podem ser "
        "enviadas pelo WhatsApp de forma individual ou em lote. A Figura 4 mostra uma ordem de serviço e a Figura 5, o "
        "painel financeiro."
    )
    pdf.figuras([
        (PRINTS / "10_os_detalhe.png", "Detalhe da ordem de serviço"),
        (PRINTS / "16_financeiro.png", "Painel financeiro"),
    ])

    pdf.secao("4. Resultados Obtidos")
    pdf.paragrafo(
        "Como resultado, foi entregue um sistema web funcional que cobre o fluxo completo da empresa, da cotação ao "
        "financeiro. O back-end reúne 26 controllers REST, 36 services de negócio e 30 entidades persistidas no "
        "PostgreSQL, e o front-end possui 20 páginas React organizadas por módulo."
    )
    pdf.paragrafo(
        "Nos testes realizados, como a cotação de 50 cadeiras para igreja apresentada nas Figuras 2 e 3, o sistema "
        "comparou os preços entre as distribuidoras, indicou a de menor custo e calculou automaticamente insumos, frete "
        "e lucro, substituindo as contas que antes eram feitas à mão."
    )
    pdf.paragrafo(
        "Com a integração entre os módulos, a ordem de serviço passou a ser gerada a partir da cotação sem redigitação "
        "de dados, o estoque é atualizado automaticamente e as contas a pagar e a receber são criadas a partir da ordem "
        "de serviço. As informações que antes ficavam em papel e planilhas passaram a ser registradas em um único banco "
        "de dados, com histórico de preços, produção, estoque e pagamentos."
    )

    pdf.secao("5. Considerações Finais")
    pdf.paragrafo(
        "O HSA Serralheria atingiu o objetivo de centralizar em um único sistema o processo comercial e produtivo da "
        "empresa. A escolha automática da distribuidora de menor preço, a integração entre cotação, ordem de serviço, "
        "estoque e financeiro e o envio de documentos pelo WhatsApp tornam o atendimento mais ágil e reduzem erros e "
        "retrabalho."
    )
    pdf.paragrafo(
        "Como trabalhos futuros, propõem-se a hospedagem do sistema em nuvem, a criação de uma versão para "
        "dispositivos móveis voltada à oficina e a ampliação dos relatórios gerenciais para apoio à tomada de decisão."
    )

    pdf.referencias(REFERENCIAS)

    pdf.output(str(OUT_PDF))
    OUT_COD.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUT_PDF, OUT_COD)
    print(f"{OUT_PDF.name}: {pdf.page_no()} páginas | resumo: {len(RESUMO.split())} palavras")


if __name__ == "__main__":
    gerar()
