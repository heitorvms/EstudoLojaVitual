# HSA Serralheria – Atualização da Documentação do TCC
## PARTE 4 – Textos prontos para colar (Resumo, Caps. 3, 4, 6, 8, 9)

**Instrução:** substituir os trechos correspondentes no ODT. Números conferidos no código (set/2026): **27** controllers, **37** services, **32** repositories, **45** arquivos em `entity/`, **21** páginas React, **21** services frontend. Contagem de tabelas físicas no PostgreSQL depende do `ddl-auto`; documentar como “tabelas/entidades mapeadas pelo JPA” quando não houver dump oficial.

---

## RESUMO (substituir)

Este projeto tem como objetivo desenvolver um software web para a HSA Serralheria, empresa cuja atividade principal é a fabricação de artigos de serralheria (CNAE 25.42-0-00), e secundárias incluem serviços de usinagem, tornearia e solda (CNAE 25.39-0-01), fabricação de esquadrias de metal (CNAE 25.12-8-00), além de estruturas metálicas e obras em ferro. O sistema automatiza orçamentos e cotações com cálculo de custos, medidas e templates de tipos de serviço; integra gestão financeira (contas a pagar e receber, parcelamento e cobrança), simulação de produção, compras de material em lote, estoque com retalhos, ordens de serviço com lista de corte e mão de obra, catálogo de produtos, importação de planilhas de preços e WhatsApp via WPPConnect para envio de PDFs e cobranças. Na segurança, utilizam-se Spring Security e JWT com perfis Admin, Gerente e Funcionario. O back-end foi desenvolvido em Java 21 com Spring Boot 3.3.4, Spring Data JPA, PostgreSQL e JasperReports. No front-end, utilizou-se React com PrimeReact, consumindo a API via Axios.

Palavras-chave: Sistema Web. Orçamentos Automatizados. Serralheria. Ordem de Serviço. Estoque. Java. Spring Boot. WhatsApp.

*(Ajuste o resumo para 50–100 palavras se a banca exigir o limite do modelo de artigo; a versão acima prioriza o conteúdo do monográfico.)*

### RESUMO – versão curta (~95 palavras) opcional

Este projeto desenvolve um software web para a HSA Serralheria (CNAE 25.42-0-00 e correlatos), automatizando orçamentos com medidas e templates, gestão financeira, simulação de produção, compra de materiais, estoque com retalhos, ordens de serviço (corte e mão de obra) e envio de PDFs/cobranças via WhatsApp (WPPConnect). A segurança utiliza Spring Security e JWT (perfis Admin, Gerente e Funcionario). O back-end emprega Java 21, Spring Boot 3.3.4, JPA e PostgreSQL; o front-end, React com PrimeReact e Axios.

Palavras-chave: Sistema Web. Orçamentos. Serralheria. Ordem de Serviço. Java. Spring Boot.

---

## ABSTRACT (substituir)

This project aims to develop a web software system for HSA Serralheria, whose primary activity is the manufacture of locksmith articles (CNAE 25.42-0-00), with secondary activities including machining, turning and welding (CNAE 25.39-0-01), metal frames (CNAE 25.12-8-00), and related metal structures. The system automates quotations with measurements and service-type templates; integrates financial management (accounts payable/receivable, installments and billing), production simulation, bulk material purchasing, inventory with scrap reuse, work orders with cut lists and labor tracking, product catalog, spreadsheet price import, and WhatsApp via WPPConnect for PDF quotes and billing messages. Security relies on Spring Security and JWT with Admin, Gerente and Funcionario roles. The back-end was built with Java 21, Spring Boot 3.3.4, Spring Data JPA, PostgreSQL and JasperReports. The front-end uses React with PrimeReact, consuming the API via Axios.

Keywords: Web System. Automated Budgeting. Locksmith Industry. Work Order. Inventory. Java. Spring Boot. WhatsApp.

---

## 2.4.2 Área de Abrangência (atualizar bullets)

Operacional: registro de orçamentos com medidas e templates, emissão de cotações, ordens de serviço com corte e mão de obra, consulta operacional da produção  
Gerencial: financeiro, compras de material em lote, estoque e retalhos, tipos de serviço, funcionários da oficina, fornecedores  
Estratégico: relatórios gerenciais e simulações de produção (inclusive atalho para compra) para apoio à decisão

---

## 3.1 Identificação do Sistema a Ser Desenvolvido (lista atualizada)

- Criação de cotações com cálculo automático de custos, insumos, frete e lucro  
- Informar medidas (largura, altura, folga) e aplicar template de tipo de serviço para montar materiais  
- Análise automática da distribuidora com menor preço por material  
- Geração de PDF de cotações via JasperReports  
- Geração de ordem de serviço a partir da cotação, com status da oficina (corte, solda, pintura, instalação, entrega)  
- Lista de corte com aproveitamento de retalhos e baixa de estoque  
- Lançamento de mão de obra por etapa e funcionário da oficina  
- Compra de material em lote (kg/metros/barras) com entrada em estoque e cancelamento com estorno  
- Consulta de estoque e retalhos disponíveis  
- Módulo financeiro com contas a pagar e receber, parcelamento e baixas  
- Envio automático de orçamentos e cobranças via WhatsApp (WPPConnect)  
- Simulação de produção com cálculo de consumo e atalho para gerar compra  
- Gestão de materiais com importação de planilhas de preços  
- Controle de usuários com perfis e recuperação de senha  

---

## 3.2 Objetivos Gerais do Sistema (acrescentar)

- Automatizar o cálculo de orçamentos com base nos preços das distribuidoras  
- Vincular cotação, ordem de serviço e estoque no fluxo produtivo da oficina  
- Controlar compras e saldos de material (incluindo retalhos)  
- Proporcionar gestão financeira integrada às cotações  
- Facilitar a comunicação com clientes via WhatsApp  
- Oferecer ambiente seguro com controle de acesso baseado em perfis  
- Facilitar a geração de relatórios para decisões rápidas e precisas  

---

## 3.3.1 Back-end (substituir números)

Linguagem: Java 21  
Framework principal: Spring Boot 3.3.4  
Segurança: Spring Security integrado com JWT (BCryptPasswordEncoder)  
Persistência: JPA com Hibernate — 45 classes no pacote entity (entidades e enums de domínio), 32 repositories  
Banco de Dados: PostgreSQL  
Relatórios: JasperReports 7.0.3 para geração de PDFs em memória (stream)  
Integrações: JavaMail (e-mail), RestTemplate (WPPConnect)  
Scheduler: @Scheduled para atualização diária de contas vencidas  
Camada REST: 27 controllers e 37 services de negócio  

---

## 3.3.2 Front-end (substituir números)

Framework: React 19 com 21 páginas e 21 services  
Componentes visuais: PrimeReact e Material-UI  
Estilização: TailwindCSS e Styled-components  
HTTP: Axios com interceptor JWT automático (BaseService)  
Navegação: React Router com RoleRoute para controle de acesso  

---

## 4.2 Viabilidade Técnica (substituir parágrafo dos números)

A stack tecnológica escolhida — Java 21, Spring Boot, React e PostgreSQL — é amplamente utilizada no mercado, com vasta documentação e comunidade ativa. O sistema foi desenvolvido com 27 controllers, 37 services e 45 classes no pacote de entidades (incluindo enums de domínio), demonstrando a robustez técnica da solução e a cobertura dos processos de cotação, oficina, estoque e financeiro.

---

## 6 PROJETO DOS DADOS – introdução (substituir)

Neste capítulo é apresentada a estrutura do banco de dados do sistema, ilustrada pelo Diagrama Entidade-Relacionamento atualizado com as tabelas de autenticação, cotação, financeiro, WhatsApp e, adicionalmente, as estruturas de ordem de serviço, tipo de serviço, funcionário da oficina, compra de lote, estoque, movimentação e retalho, bem como o dicionário de dados detalhado.

### 6.1 DER – texto de apoio à Figura 20

> O DER contempla o núcleo comercial (pessoa, cotação, material, preços e distribuidora), o financeiro e o WhatsApp, e o núcleo de oficina: tipo_servico e itens; ordem_servico ligada 1:1 à cotacao_servico; item_corte e ordem_servico_mao_obra; funcionario_oficina; compra_lote e itens; estoque_material (1:1 com material_disponivel); movimentacao_estoque e retalho.

*(Inserir dicionários das Tabelas 13–23 conforme PARTE2_Dicionarios.md; atualizar Tabelas 6 e 7.)*

### Lista de Tabelas – itens a acrescentar no front matter

Tabela 13 – Dicionário … Ordem_Servico  
Tabela 14 – … Item_Corte  
Tabela 15 – … Ordem_Servico_Mao_Obra  
Tabela 16 – … Funcionario_Oficina  
Tabela 17 – … Tipo_Servico  
Tabela 18 – … Tipo_Servico_Item  
Tabela 19 – … Compra_Lote  
Tabela 20 – … Compra_Lote_Item  
Tabela 21 – … Estoque_Material  
Tabela 22 – … Movimentacao_Estoque  
Tabela 23 – … Retalho  
Tabela 24 – … Material (item da cotação), se ainda não existir no ODT  

---

## 8.1 Níveis de Acesso (substituir)

O controle de acesso é realizado por meio de credenciais individuais (e-mail + senha) com autenticação JWT. As permissões são gerenciadas no módulo de Gestão de Usuários e verificadas via Spring Security no back-end e RoleRoute no front-end.

**Acesso Administrador (Admin):** permissão total — usuários, configurações WhatsApp e todos os módulos operacionais e gerenciais.

**Acesso Gerente:** cotações, ordens de serviço, tipos de serviço, funcionários da oficina, compras de lote, estoque/retalhos, financeiro, materiais, distribuidoras, simulação, relatórios, configurações e envios via WhatsApp. Não gerencia usuários (quando restrito ao perfil Admin no módulo de pessoas).

**Acesso Funcionário (Funcionario):** home, cotações (criar/visualizar), ordens de serviço (listar/detalhar/operar corte e mão de obra conforme telas liberadas), simulação de produção e funcionalidades básicas. Sem acesso a financeiro, compras de lote, estoque, tipos de serviço, funcionários da oficina, cadastros de materiais/distribuidoras e configurações.

| Módulo / rota | Funcionario | Gerente | Admin |
|---------------|:-----------:|:-------:|:-----:|
| Home | Sim | Sim | Sim |
| Cotações / Criar cotação | Sim | Sim | Sim |
| Ordens de serviço | Sim | Sim | Sim |
| Simulação de produção | Sim | Sim | Sim |
| Tipos de serviço | Não | Sim | Sim |
| Funcionários da oficina | Não | Sim | Sim |
| Compras de lote | Não | Sim | Sim |
| Estoque / retalhos | Não | Sim | Sim |
| Financeiro | Não | Sim | Sim |
| Materiais / Distribuidoras | Não | Sim | Sim |
| Configurações / WhatsApp | Não | Sim | Sim |
| Gestão de usuários* | Não | — | Sim |

\*Conforme regra já adotada no TCC para o módulo de pessoas/permissões.

Este modelo proporciona maior segurança, rastreabilidade e organização. A implementação utiliza JWT Bearer Token com validade de 15 minutos (ou 1 dia com “Lembrar de mim”), BCryptPasswordEncoder para senhas e @EnableMethodSecurity(prePostEnabled = true) nos endpoints sensíveis.

---

## 9 CONCLUSÃO (parágrafos a substituir/ampliar)

O desenvolvimento do sistema para a HSA Serralheria representou uma solução eficaz e personalizada para atender às necessidades de gestão de orçamentos, controle de materiais, produção na oficina, cadastro de clientes, geração de relatórios e segurança da informação. Através da aplicação de boas práticas de engenharia de software, utilizando Java com Spring Boot no back-end e React no front-end, foi possível construir uma plataforma moderna, escalável e de fácil manutenção.

O sistema evoluiu além do escopo inicial de orçamentos, incorporando gestão financeira completa; simulação de produção; integração WhatsApp via WPPConnect; importação de planilhas de preços; e, na camada de oficina, tipos de serviço (templates), ordens de serviço com status produtivos, lista de corte com retalhos, lançamento de mão de obra, compra de material em lote com entrada e estorno de estoque, além de scheduler para contas vencidas.

O sistema também incorporou autenticação via JWT e controle de permissões por perfil (Admin, Gerente, Funcionario). Os módulos foram organizados de forma clara e funcional, com 27 controllers REST, 37 services de negócio, 32 repositories e 45 classes no pacote de entidades JPA, persistidas em PostgreSQL.

Durante análise, modelagem, desenvolvimento e documentação, aplicaram-se conceitos de banco de dados relacional, arquitetura REST, orientação a objetos, integração de sistemas e modelagem UML, fortalecendo o aprendizado acadêmico com a vivência em um projeto real.

Conclui-se que o sistema atende às demandas da empresa e oferece base para expansões futuras, contribuindo para a digitalização dos processos internos e para o aumento da produtividade da HSA Serralheria.

---

## Lista de Ilustrações – acréscimos (alinhar à Parte 3)

Figura 22 – Diagrama de Sequência – Gerar OS a partir da Cotação  
Figura 23 – Diagrama de Sequência – Lista de Corte / Baixa de Estoque  
Figura 24 – Diagrama de Sequência – Lançar Mão de Obra na OS  
Figura 25 – Diagrama de Sequência – Compra de Lote  
Figura 26 – Diagrama de Sequência – Cancelar Compra  
Figura 27 – Diagrama de Sequência – Compra a partir da Simulação  
Figura 28 – Diagrama de Sequência – Tipo de Serviço e Cotação com Medidas  

*(Renumerar páginas no sumário após montar o ODT.)*

---

## Título da capa (opcional – só se a banca aceitar ampliar)

Atual: *Sistema Web para Geração Automatizada de Orçamentos Comerciais Utilizando Java com Spring Boot*

Sugestão (se quiser refletir o escopo completo):  
*Sistema Web para Orçamentos, Ordens de Serviço e Gestão de Estoque em Serralheria Utilizando Java com Spring Boot*

Manter o título antigo é aceitável se o resumo e os capítulos deixarem claro o escopo ampliado.

---

## Próxima entrega (PARTE 5)
Montagem: gerar um `.docx`/`.odt` consolidado com as Partes 1–4 (textos + tabelas), pronto para você colar figuras exportadas do Mermaid. Confirmar se prefere **DOCX** ou **ODT**.
