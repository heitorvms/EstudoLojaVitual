# -*- coding: utf-8 -*-
"""Gera a apresentação (16:9) do sistema HSA Serralheria, no estilo do modelo do autor."""
import shutil
from pathlib import Path

from fpdf import FPDF

from gerar_artigo import PRINTS, SEM_MENU, SEM_MENU_RODAPE, recortar

ROOT = Path(__file__).resolve().parent
FONTS = ROOT / "fonts"
LOGOS = ROOT / "logos"
OUT_PDF = ROOT / "HSA_Apresentacao_Sistema.pdf"
OUT_COD = Path(r"c:/Users/Heitor/OneDrive/Área de Trabalho/cod_tcc") / OUT_PDF.name

W, H = 338.67, 190.5
ARDOSIA = (0x53, 0x5C, 0x6A)
AZUL = (0xB8, 0xC6, 0xDD)
CINZA = (0xF0, 0xF1, 0xF4)
BRANCO = (0xF0, 0xF1, 0xF4)
ESCURO = (0x11, 0x1B, 0x1E)
DESTAQUE = (0x6A, 0x00, 0xE0)

ETAPAS = ["Simulação", "Cotação", "Ordem de Serviço", "Estoque", "Financeiro"]

LOGOS_POSICAO = [
    ("logo_0.png", "Spring Boot", (81, 131, 391, 294)),
    ("logo_1.png", "Java 21", (480, 88, 708, 316)),
    ("logo_3.png", "React 19", (803, 88, 1031, 315)),
    ("logo_4.png", "JavaScript", (1132, 88, 1359, 315)),
    ("logo_6.png", "PostgreSQL", (86, 404, 311, 636)),
    ("logo_2.png", "VS Code", (487, 408, 714, 635)),
    ("logo_7.png", "WPPConnect", (787, 392, 1047, 651)),
    ("logo_5.png", "Postman", (1132, 408, 1359, 635)),
]


class Apresentacao(FPDF):
    def __init__(self):
        super().__init__(orientation="L", unit="mm", format=(H, W))
        self.set_auto_page_break(False)
        self.set_margins(0, 0, 0)
        self.add_font("Serif", "", str(FONTS / "DMSerifDisplay-Regular.ttf"))
        self.add_font("Poppins", "", str(FONTS / "Poppins-Light.ttf"))
        self.add_font("Poppins", "B", str(FONTS / "Poppins-Medium.ttf"))

    def slide(self, fundo):
        self.add_page()
        self.set_fill_color(*fundo)
        self.rect(0, 0, W, H, "F")

    def texto(self, x, y, largura, conteudo, fonte="Poppins", estilo="", tamanho=12, cor=ESCURO, align="L", altura=None):
        self.set_font(fonte, estilo, tamanho)
        self.set_text_color(*cor)
        self.set_xy(x, y)
        self.multi_cell(largura, altura or tamanho * 0.3528 * 1.45, conteudo, align=align,
                        new_x="LEFT", new_y="NEXT")

    def linha(self, x1, y, x2, cor, espessura=0.3):
        self.set_draw_color(*cor)
        self.set_line_width(espessura)
        self.line(x1, y, x2, y)

    def marcadores(self, x, y, largura, itens, tamanho=12, cor=ESCURO, espaco=2.2):
        for item in itens:
            self.set_fill_color(*cor)
            self.ellipse(x, y + tamanho * 0.3528 * 0.55, 1.4, 1.4, "F")
            self.texto(x + 5, y, largura - 5, item, tamanho=tamanho, cor=cor)
            y = self.get_y() + espaco
        return y

    def trilha(self, atual):
        largura, gap, y = 34, 3, 12
        x = W - 14 - len(ETAPAS) * largura - (len(ETAPAS) - 1) * gap
        for i, etapa in enumerate(ETAPAS):
            ativo = i == atual
            self.set_fill_color(*(DESTAQUE if ativo else (0xDD, 0xE1, 0xE8)))
            self.rect(x, y, largura, 8, "F", round_corners=True, corner_radius=2)
            self.set_font("Poppins", "B" if ativo else "", 8.5)
            self.set_text_color(*((255, 255, 255) if ativo else (0x53, 0x5C, 0x6A)))
            self.set_xy(x, y)
            self.cell(largura, 8, f"{i + 1}. {etapa}", align="C")
            x += largura + gap

    def tela_processo(self, etapa, titulo, descricao, telas):
        self.slide(CINZA)
        self.texto(14, 9, 170, titulo, fonte="Serif", tamanho=34, cor=ARDOSIA, altura=15)
        self.trilha(etapa)
        self.texto(14, 27, W - 28, descricao, tamanho=11.5)
        largura, gap, topo = 150, 10, 44
        x = (W - (largura * 2 + gap)) / 2
        for caminho, legenda, corte in telas:
            imagem = recortar(caminho, corte)
            altura = min(largura * imagem.height / imagem.width, 128)
            largura_real = altura * imagem.width / imagem.height
            xi = x + (largura - largura_real) / 2
            self.image(imagem, x=xi, y=topo, w=largura_real, h=altura)
            self.set_draw_color(0xC8, 0xCD, 0xD6)
            self.set_line_width(0.3)
            self.rect(xi, topo, largura_real, altura)
            self.texto(x, topo + altura + 2.5, largura, legenda, tamanho=10, cor=ARDOSIA, align="C")
            x += largura + gap


def capa(pdf):
    pdf.slide(ARDOSIA)
    pdf.texto(0, 22, W, "UNIPAR - Universidade Paranaense - Paranavaí", fonte="Serif", tamanho=19, cor=BRANCO, align="C")
    pdf.texto(0, 62, W, "HSA Serralheria", fonte="Serif", tamanho=80, cor=BRANCO, align="C", altura=34)
    pdf.linha(44, 115, W - 44, (0xB8, 0xBE, 0xC8))
    pdf.texto(0, 128, W, "Sistema web para orçamentos, ordens de serviço e gestão de estoque",
              tamanho=14, cor=BRANCO, align="C")
    pdf.texto(0, 157, W, "HEITOR VENÂNCIO MARINS DA SILVA\n60002213", tamanho=11, cor=BRANCO, align="C")


def ramo_atuacao(pdf):
    pdf.slide(AZUL)
    pdf.texto(64, 36, 210, "Ramo de atuação", fonte="Serif", tamanho=60, altura=26)
    pdf.linha(64, 64, 268, ESCURO, 0.2)
    pdf.texto(64, 84, 204, (
        "A HSA Serralheria é uma empresa do ramo metalúrgico que atua na fabricação e comercialização de estruturas "
        "metálicas, portões e cadeiras produzidas em escala. Além desses produtos, a empresa realiza diversos serviços "
        "de serralheria, oferecendo soluções personalizadas conforme as necessidades de seus clientes, sempre "
        "priorizando qualidade, eficiência e confiabilidade."
    ), tamanho=12.5)


def problema_solucao(pdf):
    pdf.slide(CINZA)
    pdf.texto(28, 32, 250, "Problema e solução", fonte="Serif", tamanho=60, cor=ARDOSIA, altura=26)
    pdf.linha(92, 92, 310, (0x8A, 0x92, 0x9E))
    pdf.texto(92, 98, 100, "Problema atual da empresa", estilo="B", tamanho=13)
    pdf.marcadores(92, 110, 100, [
        "Orçamentos lentos e calculados à mão",
        "Anotações em papel e risco de erros de cálculo",
        "Preços dos materiais em constante variação",
        "Sem controle de produção, estoque e mão de obra",
        "Sem histórico de fornecedores e pagamentos",
    ], tamanho=11)
    pdf.texto(210, 98, 100, "Solução do sistema", estilo="B", tamanho=13)
    pdf.marcadores(210, 110, 100, [
        "Cotação com a distribuidora de menor preço",
        "Simulação de produção em escala",
        "Ordem de serviço com baixa de estoque e mão de obra",
        "Compras de material e saldo de estoque",
        "Financeiro com cobrança e PDF via WhatsApp",
    ], tamanho=11)


def tecnologias(pdf):
    pdf.slide(ARDOSIA)
    pdf.texto(14, 10, 200, "Tecnologias utilizadas", fonte="Serif", tamanho=30, cor=BRANCO, altura=13)
    fator, escala = W / 1440, 0.72
    for arquivo, nome, (x1, y1, x2, y2) in LOGOS_POSICAO:
        x = W / 2 + (x1 * fator - W / 2) * escala
        y = 36 + (y1 * fator - 20.7) * escala
        largura, altura = (x2 - x1) * fator * escala, (y2 - y1) * fator * escala
        pdf.image(str(LOGOS / arquivo), x=x, y=y, w=largura, h=altura, keep_aspect_ratio=True)
        pdf.texto(x - 10, y + altura + 2, largura + 20, nome, tamanho=10.5, cor=BRANCO, align="C")
    pdf.texto(0, 172, W, "Também: Spring Security + JWT  ·  JasperReports  ·  PrimeReact  ·  Apache POI  ·  Docker",
              tamanho=11, cor=BRANCO, align="C")


def fluxo(pdf):
    pdf.slide(ARDOSIA)
    pdf.texto(0, 30, W, "Processo do sistema", fonte="Serif", tamanho=48, cor=BRANCO, align="C", altura=20)
    detalhes = [
        "Consumo e custo da produção em escala",
        "Menor preço entre as distribuidoras",
        "Status da produção e mão de obra",
        "Baixa automática e compras",
        "Contas e cobrança via WhatsApp",
    ]
    largura, gap, y = 54, 9, 88
    x = (W - len(ETAPAS) * largura - (len(ETAPAS) - 1) * gap) / 2
    for i, (etapa, detalhe) in enumerate(zip(ETAPAS, detalhes)):
        pdf.set_fill_color(*AZUL)
        pdf.rect(x, y, largura, 46, "F", round_corners=True, corner_radius=4)
        pdf.texto(x, y + 5, largura, str(i + 1), fonte="Serif", tamanho=24, align="C", altura=10)
        pdf.texto(x + 2, y + 17, largura - 4, etapa, estilo="B", tamanho=11.5, align="C")
        pdf.texto(x + 4, y + 26, largura - 8, detalhe, tamanho=9, align="C", altura=4.2)
        if i < len(ETAPAS) - 1:
            pdf.texto(x + largura, y + 17, gap, "›", fonte="Serif", tamanho=28, cor=BRANCO, align="C", altura=10)
        x += largura + gap


def consideracoes(pdf):
    pdf.slide(AZUL)
    pdf.texto(64, 30, 220, "Resultados", fonte="Serif", tamanho=60, altura=26)
    pdf.linha(64, 58, 268, ESCURO, 0.2)
    pdf.marcadores(64, 74, 210, [
        "Processo comercial e produtivo centralizado em um único sistema",
        "Orçamentos mais rápidos, com menos erros e histórico de preços",
        "Integração entre cotação, ordem de serviço, estoque e financeiro",
        "Comunicação com o cliente por PDF e WhatsApp",
        "Próximos passos: hospedagem em nuvem, versão mobile e novos relatórios",
    ], tamanho=13, espaco=4)


def referencias(pdf):
    pdf.slide(ARDOSIA)
    pdf.texto(0, 12, W, "Referências:", estilo="B", tamanho=28, cor=BRANCO, align="C", altura=13)
    acesso = "Acesso em: 27 set. 2026."
    colunas = [
        [
            f"Spring Boot. Versão 3.3.4. Developer: Spring Framework Team. Disponível em: https://spring.io/projects/spring-boot. {acesso}",
            f"Spring Security. Versão 6.3. Developer: Spring Framework Team. Disponível em: https://spring.io/projects/spring-security. {acesso}",
            f"JSON Web Token (jjwt). Versão 0.12.6. Developer: Stormpath / Auth0. Disponível em: https://github.com/jwtk/jjwt. {acesso}",
            f"JasperReports. Versão 7.0.3. Developer: Jaspersoft. Disponível em: https://community.jaspersoft.com/. {acesso}",
            f"PostgreSQL. Developer: PostgreSQL Global Development Group. Disponível em: https://www.postgresql.org/. {acesso}",
        ],
        [
            f"React. Versão 19.0.0. Developer: Meta Platforms, Inc. Disponível em: https://react.dev/. {acesso}",
            f"PrimeReact. Versão 10.9.3. Developer: PrimeTek Informatics. Disponível em: https://primereact.org/. {acesso}",
            f"Axios. Versão 1.8.1. Developer: Matt Zabriskie et al. Disponível em: https://axios-http.com/. {acesso}",
            f"WPPConnect Server. Developer: WPPConnect Team. Disponível em: https://github.com/wppconnect-team/wppconnect-server. {acesso}",
            f"Postman. Developer: Postman, Inc. Disponível em: https://www.postman.com/. {acesso}",
        ],
    ]
    for coluna, x in zip(colunas, (28, 176)):
        pdf.marcadores(x, 38, 138, coluna, tamanho=10.5, cor=BRANCO, espaco=5)


def encerramento(pdf):
    pdf.slide(AZUL)
    pdf.texto(0, 80, W, "Obrigado", fonte="Serif", tamanho=60, align="C", altura=26)


def gerar():
    pdf = Apresentacao()
    capa(pdf)
    ramo_atuacao(pdf)
    problema_solucao(pdf)
    tecnologias(pdf)
    fluxo(pdf)
    pdf.tela_processo(0, "Simulação",
                      "Para a produção em escala, o sistema calcula o consumo de material, a perda e o custo unitário, "
                      "e converte o resultado em orçamento.",
                      [(PRINTS / "07_simulacao_form.png", "Dados da simulação", SEM_MENU),
                       (PRINTS / "08_simulacao_resultado.png", "Resultado com custos", SEM_MENU)])
    pdf.tela_processo(1, "Cotação",
                      "Compara os preços das distribuidoras, escolhe a de menor custo e soma insumos, frete e lucro; "
                      "o orçamento sai em PDF e pode ir pelo WhatsApp.",
                      [(PRINTS / "04_cotacao_detalhe.png", "Valores por distribuidora", SEM_MENU),
                       (PRINTS / "05_cotacao_custos.png", "Composição de custos", SEM_MENU)])
    pdf.tela_processo(2, "Ordem de serviço",
                      "Gerada a partir da cotação, acompanha a produção por status e recebe as horas trabalhadas "
                      "de cada funcionário.",
                      [(PRINTS / "10_os_detalhe.png", "Detalhe da OS", SEM_MENU),
                       (PRINTS / "12_os_mao_obra.png", "Lançamento de mão de obra", SEM_MENU)])
    pdf.tela_processo(3, "Estoque e compras",
                      "A OS em produção baixa o estoque automaticamente; as compras em lote dão entrada no saldo e "
                      "podem ser estornadas.",
                      [(PRINTS / "14_estoque.png", "Saldo de estoque", SEM_MENU),
                       (PRINTS / "15_compra.png", "Nova compra de material", SEM_MENU)])
    pdf.tela_processo(4, "Financeiro",
                      "A OS gera contas a pagar e a receber por categoria; as cobranças vencidas podem ser enviadas "
                      "pelo WhatsApp.",
                      [(PRINTS / "16_financeiro.png", "Painel financeiro", SEM_MENU),
                       (PRINTS / "18_whatsapp.png", "Conexão com o WhatsApp", SEM_MENU_RODAPE)])
    consideracoes(pdf)
    referencias(pdf)
    encerramento(pdf)

    pdf.output(str(OUT_PDF))
    OUT_COD.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUT_PDF, OUT_COD)
    print(f"{OUT_PDF.name}: {pdf.page_no()} slides")


if __name__ == "__main__":
    gerar()
