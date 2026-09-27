# -*- coding: utf-8 -*-
"""Gera os diagramas UML do TCC (PlantUML local) em Documentacao_TCC/diagramas."""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "diagramas"
SRC = OUT / "puml"
JAR = ROOT / "tools" / "plantuml.jar"

ESTILO = """
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam shadowing false
skinparam backgroundColor white
skinparam ArrowColor #333333
skinparam ParticipantBackgroundColor #F4F6FA
skinparam ParticipantBorderColor #4A5568
skinparam ActorBorderColor #4A5568
skinparam DatabaseBackgroundColor #F4F6FA
skinparam SequenceLifeLineBorderColor #999999
skinparam NoteBackgroundColor #FFFBEA
skinparam ClassBackgroundColor #F8FAFC
skinparam ClassBorderColor #4A5568
skinparam ClassHeaderBackgroundColor #E2E8F0
skinparam PackageBorderColor #4A5568
skinparam UsecaseBackgroundColor #EEF4FB
skinparam UsecaseBorderColor #4A5568
skinparam RectangleBorderColor #4A5568
skinparam ComponentBackgroundColor #F4F6FA
skinparam NodeBackgroundColor #F4F6FA
"""

DIAGRAMAS = {}

DIAGRAMAS["fig02_casos_uso"] = r"""
!pragma layout smetana
left to right direction
actor "Funcionário" as F
actor "Gerente / Admin" as G
actor "Cliente" as C
actor "WPPConnect" as W
G -|> F

rectangle "Sistema HSA Serralheria" {
  usecase "Autenticar / recuperar senha" as UC1
  usecase "Cadastrar orçamento" as UC2
  usecase "Gerar PDF do orçamento" as UC3
  usecase "Simular produção" as UC4
  usecase "Manter modelos padronizados" as UC5
  usecase "Gerar orçamento a partir\nda simulação" as UC6
  usecase "Gerar ordem de serviço" as UC7
  usecase "Gerar contas da OS" as UC8
  usecase "Alterar status da OS" as UC9
  usecase "Baixar / devolver estoque" as UC10
  usecase "Lançar mão de obra" as UC11
  usecase "Enviar orçamento via WhatsApp" as UC12
  usecase "Gerenciar contas a pagar/receber" as UC13
  usecase "Cobrar cliente via WhatsApp" as UC14
  usecase "Registrar / cancelar compra\nde material" as UC15
  usecase "Consultar estoque" as UC16
  usecase "Manter funcionários e\npagar mão de obra" as UC17
  usecase "Manter materiais, preços\ne distribuidoras" as UC18
  usecase "Importar planilha de preços" as UC19
  usecase "Gerenciar usuários e permissões" as UC20
  usecase "Configurar WhatsApp" as UC21
  usecase "Manter estados e cidades" as UC22
}

F --> UC1
F --> UC2
F --> UC3
F --> UC4
F --> UC5
F --> UC6
F --> UC7
F --> UC9
F --> UC11
G --> UC12
G --> UC13
G --> UC14
G --> UC15
G --> UC16
G --> UC17
G --> UC18
G --> UC19
G --> UC20
G --> UC21
G --> UC22
UC7 ..> UC8 : <<include>>
UC9 ..> UC10 : <<include>>
UC15 ..> UC16 : <<extend>>
UC12 --> W
UC14 --> W
UC12 --> C
UC14 --> C
"""

DIAGRAMAS["fig03_classes"] = r"""
!pragma layout smetana
hide empty methods
skinparam classAttributeFontSize 10

class Estado { nome; sigla }
class Cidade { nome }
class Pessoa { nome; email; senha; cpf; endereco; cep }
class Permissao { nome }
class PermissaoPessoa
class CotacaoServico { nome; clienteNome; telefone\npercentualInsumos; valorFrete\npercentualLucro; valorTotalOrcamento }
class Material { quantidade; metros; pesoKg }
class MaterialDisponivel { descricao; unidade\ncomprimentoBarraMm; pesoKgPorMetro }
class MaterialPreco { precoUnitario; origem\ndataInicio; dataFim }
class MaterialApelido { descricaoNoFornecedor }
class Distribuidora { nome }
class PrecoMaterialCotacao { preco }
class Simulacao { nomeTrabalho; quantidade\npercentualPerda; padronizado }
class SimulacaoItem { consumoPorUnidade\nquantidadeBarras; custoEstimado }
class OrdemServico { status; estoqueBaixado\nobservacoes }
class OrdemServicoMaoDeObra { dataTrabalho; noturno; horas\nvalorHora; valorTotal; pagoFuncionario }
class FuncionarioOficina { nome; cargo\nvalorHora; valorHoraNoturno; ativo }
class ContaFinanceira { tipo; status; categoria\nvalor; valorPago; dataVencimento\nnumeroParcela; totalParcelas }
class CobrancaWhatsappHistorico { mensagem; tipo; dataDisparo }
class CompraLote { dataCompra; numeroNota\nstatus; valorTotal }
class CompraLoteItem { quantidadeKg; metros\nbarras; valorKg }
class EstoqueMaterial { quantidadeKg; metros; barras }
class MovimentacaoEstoque { tipo; referencia\ndataMovimentacao }
class ConfiguracaoWhatsapp { mensagemOrcamento\nmensagemCobranca; nomeSessao }
class WhatsappEnvioLog { status; telefoneDestino\ndataEnvio }

Cidade "*" --> "1" Estado
Pessoa "*" --> "1" Cidade
Pessoa "1" *-- "*" PermissaoPessoa
PermissaoPessoa "*" --> "1" Permissao
CotacaoServico "*" --> "0..1" Pessoa : cliente
CotacaoServico "1" *-- "*" Material
Material "*" --> "1" MaterialDisponivel
CotacaoServico "*" -- "*" Distribuidora
CotacaoServico "1" *-- "*" PrecoMaterialCotacao
MaterialDisponivel "1" -- "*" MaterialPreco
MaterialPreco "*" --> "1" Distribuidora
MaterialDisponivel "1" -- "*" MaterialApelido
Simulacao "1" *-- "*" SimulacaoItem
SimulacaoItem "*" --> "1" MaterialDisponivel
CotacaoServico "1" -- "0..1" OrdemServico
OrdemServico "1" *-- "*" OrdemServicoMaoDeObra
OrdemServicoMaoDeObra "*" --> "0..1" FuncionarioOficina
CotacaoServico "1" -- "*" ContaFinanceira
ContaFinanceira "1" -- "*" CobrancaWhatsappHistorico
CotacaoServico "1" -- "*" WhatsappEnvioLog
CompraLote "*" --> "0..1" Distribuidora
CompraLote "1" *-- "*" CompraLoteItem
CompraLoteItem "*" --> "1" MaterialDisponivel
MaterialDisponivel "1" -- "0..1" EstoqueMaterial
MaterialDisponivel "1" -- "*" MovimentacaoEstoque
"""

DIAGRAMAS["fig05_cadastro_orcamento"] = r"""
actor Usuário
participant "Frontend\n(CriarCotacao)" as FE
participant "CotacaoServico\nController" as C
participant "CotacaoServico\nService" as S
database PostgreSQL as DB

opt Origem: simulação
  Usuário -> FE : "Gerar orçamento" na Simulação
  FE -> FE : pré-preenche materiais,\ninsumos e frete
end
Usuário -> FE : informa cliente, materiais,\ndistribuidoras e preços
Usuário -> FE : informa insumos (%), frete e lucro (%)
FE -> FE : calcula custos, lucro\ne valor total
Usuário -> FE : Salvar
FE -> C : POST /api/cotacoes/
C -> S : criarCotacao(inputDTO)
S -> DB : insert cotacao_servico
loop para cada material
  S -> DB : insert material
end
loop para cada distribuidora / preço
  S -> DB : insert cotacao_distribuidora\ne preco_material_cotacao
end
S --> C : CotacaoServico
C --> FE : HTTP 200
FE --> Usuário : redireciona para /cotacoes
note over S : o financeiro não é gerado aqui;\nas contas nascem na ordem de serviço
"""

DIAGRAMAS["fig07_cadastro_funcionario"] = r"""
actor "Gerente / Admin" as U
participant "Frontend\n(FuncionariosOficina)" as FE
participant "FuncionarioOficina\nController" as C
participant "FuncionarioOficina\nService" as S
participant "FuncionarioOficina\nRepository" as R
database PostgreSQL as DB

U -> FE : informa nome, cargo, telefone,\nvalor/hora e valor/hora noturno
FE -> C : POST /api/funcionarios-oficina
C -> S : salvar(funcionario)
S -> S : define dataCriacao e ativo = true
S -> R : save(funcionario)
R -> DB : insert funcionario_oficina
DB --> R : registro salvo
R --> S : funcionario
S --> C : funcionario
C --> FE : HTTP 200
FE --> U : atualiza a lista
"""

DIAGRAMAS["fig08_relatorios"] = r"""
actor Usuário
participant "Frontend\n(VisualizarCotacao)" as FE
participant "RelatorioController" as C
participant "RelatorioService" as S
participant "JasperReports" as J
database PostgreSQL as DB

Usuário -> FE : Gerar PDF
FE -> C : GET /api/relatorios/{nomeRelatorio}?parametros
C -> S : gerarRelatorio(nome, parametros, outputStream)
S -> J : compila e preenche o .jrxml
J -> DB : consulta via DataSource
DB --> J : dados
J --> S : relatório preenchido
S --> C : PDF escrito no stream
C --> FE : HTTP 200 (application/pdf)
FE --> Usuário : download do arquivo
"""

DIAGRAMAS["fig15_financeiro"] = r"""
actor "Gerente / Admin" as U
participant "Frontend\n(Financeiro)" as FE
participant "ContaFinanceira\nController" as C
participant "CotacaoFinanceiro\nService" as S
participant "WPPConnect" as W
database PostgreSQL as DB

U -> FE : acessa /financeiro
FE -> C : GET /api/financeiro?tipo&status
C -> S : listar(tipo, status, pageable)
S -> DB : select conta_financeira
S --> FE : contas (RECEBER / PAGAR, por categoria)
FE -> C : GET /api/financeiro/resumo
C -> S : obterResumo()
S --> FE : totais a receber, a pagar e vencidos

alt Registrar baixa
  U -> FE : informa valor pago
  FE -> C : PATCH /api/financeiro/contas/{id}/baixa
  C -> S : registrarBaixa(id, dto)
  S -> DB : update status PAGA ou PARCIAL
else Cobrar cliente
  U -> FE : Cobrar via WhatsApp
  FE -> C : GET /contas/{id}/whatsapp-cobranca
  C -> S : previewCobrancaWhatsapp(id)
  S --> FE : mensagem montada
  FE -> W : abre conversa com a mensagem
  FE -> C : POST /contas/{id}/registrar-cobranca
  C -> S : registrarCobrancaWhatsapp(id)
  S -> DB : insert cobranca_whatsapp_historico
else Cancelar conta
  FE -> C : PATCH /contas/{id}/cancelar
  C -> S : cancelar(id)
  S -> DB : update status CANCELADA
end
note over S : @Scheduled atualiza diariamente\nas contas vencidas (VENCIDA)
"""

DIAGRAMAS["fig16_simulacao"] = r"""
actor Usuário
participant "Frontend\n(SimulacaoProducao)" as FE
participant "SimulacaoProducao\nController" as C
participant "SimulacaoProducao\nService" as S
database PostgreSQL as DB

opt usar modelo padronizado
  FE -> C : GET /api/simulacao-producao/historico?padronizado=true
  C -> S : listarHistorico(true)
  S --> FE : modelos
  Usuário -> FE : escolhe modelo (materiais carregados)
end
Usuário -> FE : informa materiais, consumo por unidade,\nquantidade, perda, insumos e frete
FE -> C : POST /api/simulacao-producao/calcular
C -> S : calcular(request)
S -> DB : busca materiais e melhor preço vigente
S -> S : consumo total, perda, barras,\nsobra e custo estimado
S --> FE : SimulacaoResponseDTO
Usuário -> FE : Salvar (simulação ou modelo padronizado)
FE -> C : POST /api/simulacao-producao/historico
C -> S : salvar(request)
S -> DB : insert simulacao + simulacao_item
S --> FE : HTTP 201
"""

DIAGRAMAS["fig18_deploy"] = r"""
!pragma layout smetana
node "Estação do usuário" {
  artifact "Navegador\nFrontend React (porta 3000)" as FE
}
node "Servidor de aplicação" {
  artifact "Backend Spring Boot\n(porta 8080, JWT)" as BE
  artifact "JasperReports\n(PDF em memória)" as JR
}
database "PostgreSQL\n(porta 5432)" as DB
node "Docker" {
  artifact "WPPConnect Server\n(porta 21465)" as WPP
}
cloud "WhatsApp" as WA
node "Servidor SMTP" as SMTP

FE --> BE : HTTP/JSON (API REST)
BE --> DB : JDBC / JPA
BE --> JR
BE --> WPP : HTTP (RestTemplate)
WPP --> WA
BE --> SMTP : JavaMail\n(recuperação de senha)
"""

DIAGRAMAS["fig19_componentes"] = r"""
!pragma layout smetana
package "Frontend (React)" {
  [Páginas\n(Cotações, OS, Estoque,\nFinanceiro, Simulação...)] as P
  [RoleRoute] as RR
  [BaseService (Axios + JWT)] as BS
}
package "Backend (Spring Boot)" {
  [Spring Security + JWT] as SEC
  [Controllers REST] as CT
  [Services de negócio] as SV
  [Repositories JPA] as RP
  [RelatorioService\n(JasperReports)] as REL
  [WhatsappService] as WS
  [FinanceiroVencimentoService\n(@Scheduled)] as SCH
  [EmailService (JavaMail)] as EM
}
database "PostgreSQL" as DB
[WPPConnect Server] as WPP

P --> RR
P --> BS
BS --> SEC : HTTP + Bearer token
SEC --> CT
CT --> SV
SV --> RP
RP --> DB
SV --> REL
SV --> WS
WS --> WPP
SCH --> SV
SV --> EM
"""

DIAGRAMAS["fig20_der"] = r"""
!pragma layout smetana
left to right direction
hide circle
hide empty methods
skinparam classAttributeFontSize 9
skinparam classFontSize 11

entity estado { *id <<PK>>\nnome\nsigla }
entity cidade { *id <<PK>>\nid_estado <<FK>>\nnome }
entity pessoa { *id <<PK>>\nid_cidade <<FK>>\nnome, email, senha, cpf }
entity permissao { *id <<PK>>\nnome }
entity permissao_pessoa { *id <<PK>>\nid_pessoa <<FK>>\nid_permissao <<FK>> }
entity cotacao_servico { *id <<PK>>\nid_cliente <<FK>>\nnome, cliente_nome\nvalor_total_orcamento }
entity material { *id <<PK>>\nid_cotacao <<FK>>\nid_material_disponivel <<FK>>\nquantidade, metros, peso_kg }
entity cotacao_distribuidora { id_cotacao <<FK>>\nid_distribuidora <<FK>> }
entity preco_material_cotacao { *id <<PK>>\nid_cotacao <<FK>>\nid_distribuidora <<FK>>\nid_material <<FK>>\npreco }
entity distribuidora { *id <<PK>>\nnome }
entity material_disponivel { *id <<PK>>\ndescricao, unidade\ncomprimento_barra_mm\npeso_kg_por_metro }
entity material_preco { *id <<PK>>\nid_material_disponivel <<FK>>\nid_distribuidora <<FK>>\npreco_unitario, origem }
entity material_apelido { *id <<PK>>\nid_material_disponivel <<FK>>\nid_distribuidora <<FK>> }
entity simulacao { *id <<PK>>\nnome_trabalho, padronizado }
entity simulacao_item { *id <<PK>>\nid_simulacao <<FK>>\nid_material_disponivel <<FK>> }
entity ordem_servico { *id <<PK>>\nid_cotacao <<FK,UQ>>\nstatus, estoque_baixado }
entity ordem_servico_mao_obra { *id <<PK>>\nid_ordem_servico <<FK>>\nid_funcionario <<FK>>\nhoras, noturno, pago_funcionario }
entity funcionario_oficina { *id <<PK>>\nnome, valor_hora\nvalor_hora_noturno }
entity conta_financeira { *id <<PK>>\nid_cotacao <<FK>>\nid_distribuidora <<FK>>\ntipo, status, categoria }
entity cobranca_whatsapp_historico { *id <<PK>>\nid_conta <<FK>>\ntipo, data_disparo }
entity whatsapp_envio_log { *id <<PK>>\ncotacao_id <<FK>>\nstatus, data_envio }
entity configuracao_whatsapp { *id <<PK>>\nnome_sessao, url_wppconnect }
entity compra_lote { *id <<PK>>\nid_distribuidora <<FK>>\nstatus, valor_total }
entity compra_lote_item { *id <<PK>>\nid_compra_lote <<FK>>\nid_material_disponivel <<FK>> }
entity estoque_material { *id <<PK>>\nid_material_disponivel <<FK,UQ>>\nquantidade_kg, metros, barras }
entity movimentacao_estoque { *id <<PK>>\nid_material_disponivel <<FK>>\ntipo, referencia }

cidade }o--|| estado
pessoa }o--o| cidade
permissao_pessoa }o--|| pessoa
permissao_pessoa }o--|| permissao
cotacao_servico }o--o| pessoa
material }o--|| cotacao_servico
material }o--|| material_disponivel
cotacao_distribuidora }o--|| cotacao_servico
cotacao_distribuidora }o--|| distribuidora
preco_material_cotacao }o--|| cotacao_servico
material_preco }o--|| material_disponivel
material_preco }o--|| distribuidora
material_apelido }o--|| material_disponivel
simulacao_item }o--|| simulacao
simulacao_item }o--|| material_disponivel
ordem_servico |o--|| cotacao_servico
ordem_servico_mao_obra }o--|| ordem_servico
ordem_servico_mao_obra }o--o| funcionario_oficina
conta_financeira }o--|| cotacao_servico
conta_financeira }o--o| distribuidora
cobranca_whatsapp_historico }o--|| conta_financeira
whatsapp_envio_log }o--|| cotacao_servico
compra_lote }o--o| distribuidora
compra_lote_item }o--|| compra_lote
compra_lote_item }o--|| material_disponivel
estoque_material |o--|| material_disponivel
movimentacao_estoque }o--|| material_disponivel
"""

DIAGRAMAS["fig21_arquitetura"] = r"""
!pragma layout smetana
left to right direction
rectangle "Entrada do sistema\n(login e senha)" as LOGIN
package "Cadastros" {
  [Estado]
  [Cidade]
  [Materiais]
  [Distribuidoras]
  [Funcionários]
}
package "Comercial" {
  [Cotações]
  [Simulação]
}
package "Produção" {
  [Ordens de Serviço]
}
package "Estoque" {
  [Saldo de estoque]
  [Compra de material]
}
package "Financeiro" {
  [Contas a pagar]
  [Contas a receber]
  [Cobrança WhatsApp]
}
package "Configurações" {
  [Usuários e permissões]
  [WhatsApp]
}
package "Sair" {
  [Encerrar sessão]
}
LOGIN --> Cadastros
LOGIN --> Comercial
LOGIN --> Produção
LOGIN --> Estoque
LOGIN --> Financeiro
LOGIN --> Configurações
LOGIN --> Sair
"""

DIAGRAMAS["fig22_gerar_os"] = r"""
actor Usuário
participant "Frontend\n(VisualizarCotacao /\nVisualizarOrdemServico)" as FE
participant "OrdemServico\nController" as C
participant "OrdemServico\nService" as S
participant "CotacaoFinanceiro\nService" as F
participant "EstoqueService" as E
database PostgreSQL as DB

Usuário -> FE : Gerar OS (na cotação)
FE -> C : GET /api/ordens-servico/rascunho-cotacao/{cotacaoId}
C -> S : rascunhoDeCotacao(cotacaoId)
S -> DB : verifica se já existe OS e busca a cotação
S --> FE : rascunho (cliente, materiais, valores)
Usuário -> FE : define status, observações,\nmão de obra e parcelamento
FE -> C : POST /api/ordens-servico/de-cotacao/{cotacaoId}
C -> S : criarDeCotacao(cotacaoId, input)
S -> DB : insert ordem_servico (+ mão de obra)
opt status EM_PRODUCAO ou CONCLUIDO
  S -> E : baixarBarras(material, qtd, "OS #id")
end
S -> F : gerarContasDaOrdem(os, opcoes)
F -> DB : insert conta_financeira\nRECEBER: MATERIAL e MAO_DE_OBRA (parcelas)\nPAGAR: MATERIAL, INSUMOS e FRETE
S --> FE : OrdemServicoDTO
FE --> Usuário : tela da OS
"""

DIAGRAMAS["fig23_status_os"] = r"""
actor Usuário
participant "Frontend\n(VisualizarOrdemServico)" as FE
participant "OrdemServico\nController" as C
participant "OrdemServico\nService" as S
participant "EstoqueService" as E
database PostgreSQL as DB

Usuário -> FE : altera status (ABERTO → EM_PRODUCAO)
FE -> C : PUT /api/ordens-servico/{id}
C -> S : atualizar(id, input)
S -> S : aplicarDados(os, input)
alt consumiu material e estoque_baixado = false
  loop para cada material da cotação
    S -> S : barrasNecessarias(material)
    S -> E : baixarBarras(material, barras, "OS #id")
    E -> DB : update estoque_material
    E -> DB : insert movimentacao_estoque (SAIDA_OS)
  end
  S -> DB : estoque_baixado = true
end
S --> FE : OS atualizada
note over E : sem saldo suficiente a saída é registrada\n(indica necessidade de compra)
"""

DIAGRAMAS["fig24_mao_obra"] = r"""
actor Usuário
participant "Frontend\n(VisualizarOrdemServico)" as FE
participant "OrdemServico\nController" as C
participant "OrdemServico\nService" as S
database PostgreSQL as DB

Usuário -> FE : Adicionar lançamento\n(funcionário, data, horas, turno)
FE -> C : POST /api/ordens-servico/{id}/mao-de-obra
C -> S : adicionarMaoDeObra(id, lancamento)
alt OS cancelada
  S --> FE : erro "Não é possível lançar horas em OS cancelada"
else OS ativa
  S -> DB : busca funcionario_oficina
  S -> S : valorHora = noturno ? valorHoraNoturno : valorHora
  S -> S : valorTotal = horas × valorHora
  S -> DB : insert ordem_servico_mao_obra
  S --> FE : OS com lançamentos
end
"""

DIAGRAMAS["fig25_compra"] = r"""
actor "Gerente / Admin" as U
participant "Frontend\n(FormularioCompraLote)" as FE
participant "CompraEstoque\nController" as C
participant "CompraLoteService" as S
participant "EstoqueService" as E
database PostgreSQL as DB

U -> FE : informa distribuidora, nota\ne itens (kg, metros, barras, R$/kg)
FE -> C : POST /api/compras-lote
C -> S : criar(compra)
S -> S : status = ATIVA; calcula totais
loop para cada item
  S -> E : entrarCompra(material, kg, metros, barras, ref)
  E -> DB : update estoque_material
  E -> DB : insert movimentacao_estoque (ENTRADA_COMPRA)
end
S -> DB : insert compra_lote + compra_lote_item
S --> FE : compra criada
"""

DIAGRAMAS["fig26_cancelar_compra"] = r"""
actor "Gerente / Admin" as U
participant "Frontend\n(ComprasLote)" as FE
participant "CompraEstoque\nController" as C
participant "CompraLoteService" as S
participant "EstoqueService" as E
database PostgreSQL as DB

U -> FE : Cancelar compra + motivo
FE -> C : POST /api/compras-lote/{id}/cancelar
C -> S : cancelar(id, motivo)
alt motivo vazio ou compra já cancelada
  S --> FE : erro de regra de negócio
else
  loop para cada item
    S -> E : estornarCompra(material, kg, metros, barras)
    E -> DB : update estoque_material
    E -> DB : insert movimentacao_estoque (AJUSTE)
  end
  S -> DB : status CANCELADA, motivo, data
  S --> FE : compra cancelada
end
"""

DIAGRAMAS["fig27_orcamento_simulacao"] = r"""
actor Usuário
participant "Frontend\n(SimulacaoProducao)" as SIM
participant "SimulacaoProducao\nController" as C
participant "Frontend\n(CriarCotacao)" as CC
participant "CotacaoServico\nController" as CT

Usuário -> SIM : seleciona simulação salva\ne clica "Gerar orçamento"
SIM -> C : GET /api/simulacao-producao/historico/{id}
C --> SIM : simulação com materiais
SIM -> CC : navega com state (origem = simulacao,\nmateriais, insumos, frete)
CC -> CC : pré-preenche o orçamento
Usuário -> CC : completa cliente, preços e lucro
CC -> CT : POST /api/cotacoes/
CT --> CC : cotação criada
"""

DIAGRAMAS["fig28_pagamento_mo"] = r"""
actor "Gerente / Admin" as U
participant "Frontend\n(FuncionariosOficina)" as FE
participant "FuncionarioOficina\nController" as C
participant "FuncionarioOficina\nService" as S
database PostgreSQL as DB

U -> FE : abre resumo do funcionário (período)
FE -> C : GET /api/funcionarios-oficina/{id}/resumo?inicio&fim
C -> S : resumo(id, inicio, fim)
S -> DB : select ordem_servico_mao_obra\npor funcionário e data_trabalho
S --> FE : lançamentos, horas e totais (pago / a pagar)
U -> FE : marca lançamentos como pagos
FE -> C : PATCH /api/funcionarios-oficina/{id}/lancamentos/pagamento
C -> S : registrarPagamento(id, ids, pago)
S -> DB : update pago_funcionario,\ndata_pagamento_funcionario
S --> FE : HTTP 200
note over S : lançamentos pagos não podem ser\nalterados nem removidos na OS
"""

DIAGRAMAS["fig29_cancelar_os"] = r"""
actor Usuário
participant "Frontend\n(VisualizarOrdemServico)" as FE
participant "OrdemServico\nController" as C
participant "OrdemServico\nService" as S
participant "CotacaoFinanceiro\nService" as F
participant "EstoqueService" as E
database PostgreSQL as DB

Usuário -> FE : status CANCELADO\n(opção devolver estoque)
FE -> C : PUT /api/ordens-servico/{id}
C -> S : atualizar(id, input)
S -> F : cancelarContasEmAberto(idCotacao)
F -> DB : contas PENDENTE/VENCIDA → CANCELADA
opt devolverEstoque e estoque_baixado
  loop para cada material
    S -> E : devolverBarras(material, barras, "Devolução OS #id")
    E -> DB : update estoque_material
    E -> DB : insert movimentacao_estoque (AJUSTE)
  end
  S -> DB : estoque_baixado = false
end
S --> FE : OS cancelada
"""

DIAGRAMAS["fig30_recebimento_os"] = r"""
actor Usuário
participant "Frontend\n(FinanceiroOsPanel)" as FE
participant "OrdemServico\nController" as C
participant "OrdemServico\nService" as S
participant "CotacaoFinanceiro\nService" as F
database PostgreSQL as DB

Usuário -> FE : marca "Material pago" ou\n"Mão de obra paga"
FE -> C : PATCH /api/ordens-servico/{id}/pagamento?categoria&pago
C -> S : alterarPagamento(id, categoria, pago)
alt pago = true
  S -> F : quitarRecebimento(idCotacao, categoria)
  F -> DB : contas RECEBER da categoria → PAGA
else pago = false
  S -> F : estornarRecebimento(idCotacao, categoria)
  F -> DB : contas → PENDENTE (reavalia vencidas)
end
S --> FE : OS com situação financeira
"""


def expandir_corpos(corpo):
    """Converte `class X { a; b\\nc }` em bloco multilinha aceito pelo PlantUML."""
    linhas = []
    for linha in corpo.splitlines():
        m = re.match(r"^(class|entity)\s+(\S+)\s*\{\s*(.*?)\s*\}$", linha.strip())
        if not m:
            linhas.append(linha)
            continue
        campos = [c.strip() for c in re.split(r"\\n|;", m.group(3)) if c.strip()]
        linhas.append(f"{m.group(1)} {m.group(2)} {{")
        linhas.extend(f"  {c}" for c in campos)
        linhas.append("}")
    return "\n".join(linhas)


def gerar():
    SRC.mkdir(parents=True, exist_ok=True)
    arquivos = []
    for nome, corpo in DIAGRAMAS.items():
        caminho = SRC / f"{nome}.puml"
        conteudo = expandir_corpos(corpo.strip())
        caminho.write_text(f"@startuml\n{ESTILO}\n{conteudo}\n@enduml\n", encoding="utf-8")
        arquivos.append(str(caminho))
    subprocess.run(
        ["java", "-DPLANTUML_LIMIT_SIZE=16384", "-jar", str(JAR), "-charset", "UTF-8", "-tpng", "-o", str(OUT), *arquivos],
        check=True,
    )
    print("diagramas:", len(arquivos))


if __name__ == "__main__":
    gerar()
