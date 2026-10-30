# -*- coding: utf-8 -*-
"""Gera a apresentação (16:9) com foco nas tecnologias do sistema HSA Serralheria."""
import shutil
from pathlib import Path

from fpdf import FPDF

from gerar_artigo import INTEIRA, PRINTS, recortar

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
CHIP = (0xDD, 0xE1, 0xE8)

SPRING, JAVA, VSCODE, REACT, JS, POSTMAN, POSTGRES, WPP = (f"logo_{i}.png" for i in range(8))

LOGOS_POSICAO = [
    (SPRING, "Spring Boot", (81, 131, 391, 294)),
    (JAVA, "Java 21", (480, 88, 708, 316)),
    (REACT, "React 19", (803, 88, 1031, 315)),
    (JS, "JavaScript", (1132, 88, 1359, 315)),
    (POSTGRES, "PostgreSQL", (86, 404, 311, 636)),
    (VSCODE, "VS Code", (487, 408, 714, 635)),
    (WPP, "WPPConnect", (787, 392, 1047, 651)),
    (POSTMAN, "Postman", (1132, 408, 1359, 635)),
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

    def etiqueta(self, x, y, conteudo, fundo=CHIP, cor=ARDOSIA, tamanho=11):
        self.set_font("Poppins", "B", tamanho)
        largura = self.get_string_width(conteudo) + 10
        self.set_fill_color(*fundo)
        self.rect(x, y, largura, 10, "F", round_corners=True, corner_radius=2.5)
        self.set_text_color(*cor)
        self.set_xy(x, y)
        self.cell(largura, 10, conteudo, align="C")
        return x + largura + 4

    def slide_tecnologia(self, titulo, subtitulo, logos, etiquetas, itens):
        self.slide(CINZA)
        self.texto(22, 16, 290, titulo, fonte="Serif", tamanho=40, cor=ARDOSIA, altura=17)
        self.texto(22, 36, 290, subtitulo, tamanho=13, cor=ARDOSIA)
        self.linha(22, 50, W - 22, (0xC8, 0xCD, 0xD6))
        self.set_fill_color(255, 255, 255)
        self.rect(22, 60, 100, 110, "F", round_corners=True, corner_radius=4)
        tamanho_logo = 44 if len(logos) > 1 else 62
        y = 60 + (110 - tamanho_logo * len(logos) - 8 * (len(logos) - 1)) / 2
        for logo in logos:
            self.image(str(LOGOS / logo), x=72 - tamanho_logo / 2, y=y, w=tamanho_logo, h=tamanho_logo,
                       keep_aspect_ratio=True)
            y += tamanho_logo + 8
        x = 138
        for nome in etiquetas:
            x = self.etiqueta(x, 60, nome)
        self.marcadores(138, 80, 178, itens, tamanho=13, espaco=4.5)


def capa(pdf):
    pdf.slide(ARDOSIA)
    pdf.texto(0, 22, W, "UNIPAR - Universidade Paranaense - Paranavaí", fonte="Serif", tamanho=19, cor=BRANCO, align="C")
    pdf.texto(0, 62, W, "HSA Serralheria", fonte="Serif", tamanho=80, cor=BRANCO, align="C", altura=34)
    pdf.linha(44, 115, W - 44, (0xB8, 0xBE, 0xC8))
    pdf.texto(0, 128, W, "Tecnologias web aplicadas ao desenvolvimento de um sistema de gestão",
              tamanho=14, cor=BRANCO, align="C")
    pdf.texto(0, 157, W, "HEITOR VENÂNCIO MARINS DA SILVA\n60002213", tamanho=11, cor=BRANCO, align="C")


def objetivo(pdf):
    pdf.slide(AZUL)
    pdf.texto(64, 34, 220, "Objetivo", fonte="Serif", tamanho=60, altura=26)
    pdf.linha(64, 62, 274, ESCURO, 0.2)
    pdf.texto(64, 80, 210, (
        "Apresentar as tecnologias utilizadas no desenvolvimento de um sistema web de gestão para a HSA Serralheria, "
        "empresa do ramo metalúrgico de Paranavaí-PR, detalhando a função de cada uma e como elas se integram."
    ), tamanho=14)
    pdf.texto(64, 122, 210, "Critérios de escolha", estilo="B", tamanho=13)
    x = 64
    for criterio in ("Código aberto", "Maturidade", "Comunidade ativa", "Compatibilidade"):
        x = pdf.etiqueta(x, 134, criterio, fundo=(0xF0, 0xF1, 0xF4), cor=ESCURO, tamanho=11)


def visao_geral(pdf):
    pdf.slide(ARDOSIA)
    pdf.texto(14, 10, 250, "Tecnologias utilizadas", fonte="Serif", tamanho=30, cor=BRANCO, altura=13)
    fator, escala = W / 1440, 0.72
    for arquivo, nome, (x1, y1, x2, y2) in LOGOS_POSICAO:
        x = W / 2 + (x1 * fator - W / 2) * escala
        y = 36 + (y1 * fator - 20.7) * escala
        largura, altura = (x2 - x1) * fator * escala, (y2 - y1) * fator * escala
        pdf.image(str(LOGOS / arquivo), x=x, y=y, w=largura, h=altura, keep_aspect_ratio=True)
        pdf.texto(x - 10, y + altura + 2, largura + 20, nome, tamanho=10.5, cor=BRANCO, align="C")
    pdf.texto(0, 172, W, "Também: Spring Security + JWT  ·  Hibernate  ·  PrimeReact  ·  Axios  ·  JasperReports  ·  "
              "Apache POI  ·  Docker  ·  Git", tamanho=11, cor=BRANCO, align="C")


def jwt(pdf):
    pdf.slide(CINZA)
    pdf.texto(22, 16, 290, "Segurança: Spring Security + JWT", fonte="Serif", tamanho=40, cor=ARDOSIA, altura=17)
    pdf.texto(22, 36, 290, "Autenticação sem sessão no servidor (stateless)", tamanho=13, cor=ARDOSIA)
    pdf.linha(22, 50, W - 22, (0xC8, 0xCD, 0xD6))
    partes = [
        ("Cabeçalho", "algoritmo HMAC-SHA", (0xF4, 0xC4, 0xC4)),
        ("Conteúdo (claims)", "usuário, perfil e validade", (0xD9, 0xC8, 0xF2)),
        ("Assinatura", "garante que não foi alterado", (0xC4, 0xE3, 0xF4)),
    ]
    x = 22
    for i, (nome, detalhe, cor) in enumerate(partes):
        pdf.set_fill_color(*cor)
        pdf.rect(x, 60, 88, 30, "F", round_corners=True, corner_radius=3)
        pdf.texto(x, 65, 88, nome, estilo="B", tamanho=13, align="C")
        pdf.texto(x, 75, 88, detalhe, tamanho=10.5, align="C")
        if i < 2:
            pdf.texto(x + 88, 64, 13, ".", fonte="Serif", tamanho=40, cor=ARDOSIA, align="C", altura=17)
        x += 101
    pdf.texto(22, 93, 290, "Token JWT (RFC 7519): três partes em Base64URL separadas por ponto", tamanho=10.5,
              cor=ARDOSIA)
    pdf.marcadores(22, 110, 294, [
        "Login: a biblioteca jjwt 0.12.6 gera o token assinado",
        "Front-end: o Axios envia o cabeçalho Authorization: Bearer em cada requisição",
        "Back-end: um filtro (OncePerRequestFilter) valida assinatura e validade e libera o acesso por perfil",
        "Senhas armazenadas com hash BCrypt, que inclui um valor aleatório (salt)",
    ], tamanho=13, espaco=4.5)


def resultado(pdf):
    pdf.slide(CINZA)
    pdf.texto(22, 16, 150, "Resultado", fonte="Serif", tamanho=40, cor=ARDOSIA, altura=17)
    pdf.texto(22, 36, 85, "O sistema HSA Serralheria em funcionamento", tamanho=13, cor=ARDOSIA)
    imagem = recortar(PRINTS / "04_cotacao_detalhe.png", INTEIRA)
    largura = 200
    altura = largura * imagem.height / imagem.width
    pdf.image(imagem, x=W - 22 - largura, y=(H - altura) / 2 + 6, w=largura)
    pdf.set_draw_color(0xC8, 0xCD, 0xD6)
    pdf.rect(W - 22 - largura, (H - altura) / 2 + 6, largura, altura)
    y = 62
    for numero, rotulo in (("26", "controllers REST"), ("36", "services"), ("30", "entidades JPA"),
                           ("20", "páginas React")):
        pdf.texto(22, y, 90, numero, fonte="Serif", tamanho=34, cor=ARDOSIA, altura=14)
        pdf.texto(22, y + 14, 90, rotulo, tamanho=12)
        y += 28


def consideracoes(pdf):
    pdf.slide(AZUL)
    pdf.texto(64, 30, 220, "Considerações finais", fonte="Serif", tamanho=54, altura=24)
    pdf.linha(64, 58, 274, ESCURO, 0.2)
    pdf.marcadores(64, 72, 210, [
        "Tecnologias de código aberto, bem documentadas e integradas pela API REST",
        "Spring Boot e Spring Data JPA reduziram o código de infraestrutura",
        "JWT separou front-end e back-end sem sessão no servidor",
        "Docker simplificou a execução do WPPConnect",
        "Próximos passos: toda a aplicação em Docker, testes automatizados e nuvem",
    ], tamanho=13, espaco=4)


def referencias(pdf):
    pdf.slide(ARDOSIA)
    pdf.texto(0, 12, W, "Referências:", estilo="B", tamanho=28, cor=BRANCO, align="C", altura=13)
    acesso = "Acesso em: 27 set. 2026."
    colunas = [
        [
            f"Java SE. Versão 21. Developer: Oracle. Disponível em: https://www.oracle.com/java/. {acesso}",
            f"Spring Boot. Versão 3.3.4. Developer: Spring Framework Team. Disponível em: https://spring.io/projects/spring-boot. {acesso}",
            f"Spring Security. Versão 6.3. Developer: Spring Framework Team. Disponível em: https://spring.io/projects/spring-security. {acesso}",
            f"JSON Web Token (jjwt). Versão 0.12.6. Developer: Stormpath / Auth0. Disponível em: https://github.com/jwtk/jjwt. {acesso}",
            f"Hibernate ORM. Developer: Red Hat. Disponível em: https://hibernate.org/orm/. {acesso}",
            f"PostgreSQL. Developer: PostgreSQL Global Development Group. Disponível em: https://www.postgresql.org/. {acesso}",
        ],
        [
            f"React. Versão 19.0.0. Developer: Meta Platforms, Inc. Disponível em: https://react.dev/. {acesso}",
            f"PrimeReact. Versão 10.9.3. Developer: PrimeTek Informatics. Disponível em: https://primereact.org/. {acesso}",
            f"Axios. Versão 1.8.1. Developer: Matt Zabriskie et al. Disponível em: https://axios-http.com/. {acesso}",
            f"JasperReports. Versão 7.0.3. Developer: Jaspersoft. Disponível em: https://community.jaspersoft.com/. {acesso}",
            f"WPPConnect Server. Developer: WPPConnect Team. Disponível em: https://github.com/wppconnect-team/wppconnect-server. {acesso}",
            f"Docker. Developer: Docker, Inc. Disponível em: https://docs.docker.com/. {acesso}",
        ],
    ]
    for coluna, x in zip(colunas, (28, 176)):
        pdf.marcadores(x, 34, 138, coluna, tamanho=10, cor=BRANCO, espaco=3.5)


def encerramento(pdf):
    pdf.slide(AZUL)
    pdf.texto(0, 80, W, "Obrigado", fonte="Serif", tamanho=60, align="C", altura=26)


def gerar():
    pdf = Apresentacao()
    capa(pdf)
    objetivo(pdf)
    visao_geral(pdf)
    pdf.slide_tecnologia(
        "Back-end: Java 21 + Spring Boot", "Linguagem e framework do servidor",
        [JAVA, SPRING], ["Java 21 LTS", "Spring Boot 3.3.4", "Maven"],
        [
            "Java: orientada a objetos, compilada para bytecode e executada na JVM",
            "Spring: inversão de controle e injeção de dependências",
            "Spring Boot: autoconfiguração, starters e servidor Tomcat embutido",
            "API REST com @RestController, em camadas controller, service e repository",
            "Lombok gera getters, setters e construtores por anotações",
        ],
    )
    pdf.slide_tecnologia(
        "Persistência: JPA + PostgreSQL", "Mapeamento objeto-relacional e banco de dados",
        [POSTGRES], ["Spring Data JPA", "Hibernate", "PostgreSQL"],
        [
            "JPA: especificação de mapeamento objeto-relacional; Hibernate: implementação",
            "Classes @Entity viram tabelas; o Hibernate gera o SQL do PostgreSQL",
            "Interfaces JpaRepository já trazem inserir, consultar, alterar e excluir",
            "PostgreSQL: código aberto, transações ACID e chaves estrangeiras",
        ],
    )
    jwt(pdf)
    pdf.slide_tecnologia(
        "Front-end: React 19", "Interface executada no navegador",
        [REACT, JS], ["React 19", "PrimeReact 10", "Axios 1.8", "React Router 7"],
        [
            "React: interface declarativa baseada em componentes reutilizáveis",
            "Estado controlado com hooks (useState, useEffect)",
            "SPA: o React Router troca as páginas sem recarregar e protege rotas por perfil",
            "PrimeReact e Material UI: tabelas, formulários e diálogos prontos",
            "Axios: cliente HTTP com interceptor que envia o token JWT",
        ],
    )
    pdf.slide_tecnologia(
        "Integrações e bibliotecas", "Recursos de apoio ao back-end",
        [WPP], ["WPPConnect + Docker", "JasperReports 7", "Apache POI 5"],
        [
            "WPPConnect Server: API REST de código aberto para o WhatsApp Web",
            "Docker: executa o WPPConnect em contêiner, isolado e com suas dependências",
            "JasperReports: modelos JRXML preenchidos e exportados em PDF na memória",
            "Apache POI: leitura e escrita de planilhas .xlsx (XSSFWorkbook)",
            "JavaMail + FreeMarker: envio de e-mails com modelos",
        ],
    )
    pdf.slide_tecnologia(
        "Ferramentas de desenvolvimento", "Apoio à codificação, testes e documentação",
        [VSCODE, POSTMAN], ["VS Code", "Postman", "Git", "PlantUML"],
        [
            "VS Code: editor com extensões para Java e JavaScript",
            "Postman: testes dos endpoints da API com o token JWT",
            "Git: versionamento do código",
            "Maven e NPM: dependências e build do back-end e do front-end",
            "PlantUML: diagramas UML gerados a partir de texto",
        ],
    )
    resultado(pdf)
    consideracoes(pdf)
    referencias(pdf)
    encerramento(pdf)

    pdf.output(str(OUT_PDF))
    OUT_COD.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUT_PDF, OUT_COD)
    print(f"{OUT_PDF.name}: {pdf.page_no()} slides")


if __name__ == "__main__":
    gerar()
