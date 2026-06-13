# HSA Serralheria — Sistema de Orçamentos

Monorepo com **Backend** (Spring Boot 3.3.4 + Java 21) e **Frontend** (React).

| Pasta | Tecnologia | Porta padrão |
|-------|------------|--------------|
| `Backend/` | Java 21, Spring Boot, PostgreSQL, JasperReports | `8080` |
| `Frontend/` | React, PrimeReact, Axios | `3000` |
| WPPConnect (externo) | Node.js + `@wppconnect/server` | `21465` |

---

## Pré-requisitos

Instale antes de subir o sistema:

| Ferramenta | Versão | Download |
|------------|--------|----------|
| **Java JDK** | 21 | https://adoptium.net |
| **Maven** | 3.9+ | https://maven.apache.org (ou use o wrapper da IDE) |
| **Node.js** | LTS | https://nodejs.org |
| **PostgreSQL** | 14+ | https://www.postgresql.org |

---

## 1. Banco de dados (PostgreSQL)

1. Crie o banco:

```sql
CREATE DATABASE loja;
```

2. Copie as credenciais locais do backend:

```powershell
cd Backend\src\main\resources
copy application-local.properties.example application-local.properties
```

3. Edite `application-local.properties` e defina a senha do Postgres:

```properties
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA_AQUI
```

> O Hibernate cria/atualiza as tabelas automaticamente (`ddl-auto=update`). O `schema.sql` roda na inicialização.

**Usuário padrão (seed automático):**

| Campo | Valor |
|-------|-------|
| E-mail | `heitor@local.dev` |
| Senha | `123` |
| Perfil | Admin |

---

## 2. Backend (Spring Boot)

```powershell
cd Backend
mvn spring-boot:run
```

API disponível em: **http://localhost:8080**

Verifique no log se subiu sem erros de conexão com o PostgreSQL.

---

## 3. Frontend (React)

```powershell
cd Frontend
npm install
npm start
```

Interface em: **http://localhost:3000**

O arquivo `Frontend/.env.development` já aponta para a API:

```
REACT_APP_API_URL=http://localhost:8080/api
```

Faça login com `heitor@local.dev` / `123`.

---

## 4. WPPConnect — WhatsApp (passo a passo)

Esta é a parte mais trabalhosa. O HSA usa o **WPPConnect** como servidor intermediário entre o backend Java e o WhatsApp Web.

**Credenciais padrão do projeto** (já configuradas em `application.properties`):

| Parâmetro | Valor |
|-----------|-------|
| URL | `http://localhost:21465` |
| Sessão | `hsa-serralheria` |
| Secret Key | `hsa-chave-123` |

---

### 4.1 Instalar o Node.js

1. Acesse https://nodejs.org
2. Baixe a versão **LTS**
3. Instale e reinicie o PC

---

### 4.2 Criar a pasta e instalar o WPPConnect

Abra o **PowerShell** e execute:

```powershell
mkdir C:\wppconnect
cd C:\wppconnect
npm init -y
npm install @wppconnect/server
npm install @babel/runtime prom-client express
```

---

### 4.3 Criar o arquivo `server.js`

```powershell
notepad C:\wppconnect\server.js
```

Cole o conteúdo abaixo e salve:

```javascript
const { initServer } = require('@wppconnect/server');

initServer({
  secretKey: 'hsa-chave-123',
  host: 'http://localhost',
  port: 21465,
});
```

> O `secretKey` e a porta **devem ser iguais** aos do `Backend/src/main/resources/application.properties`.

---

### 4.4 Iniciar o servidor WPPConnect

```powershell
cd C:\wppconnect
node server.js
```

Deve aparecer algo como:

```
Server is running on port: 21465
Visit http://localhost:21465/api-docs for Swagger docs
```

**Deixe esse terminal aberto** enquanto usar o WhatsApp.

---

### 4.5 Conectar pelo sistema HSA (recomendado)

Com WPPConnect rodando **e** o backend Spring Boot ligado:

1. Faça login como **Admin** ou **Gerente**
2. Acesse **Configurações → aba WhatsApp**
3. O backend gera o token automaticamente ao subir (`WppConnectStartup`)
4. Clique em **Conectar WhatsApp**
5. Escaneie o **QR Code** exibido na tela (expira em 60 segundos)
6. Quando o status mudar para **Conectado**, o envio de orçamentos está liberado

> **Ordem correta:** WPPConnect → Backend → Frontend → Conectar na aba WhatsApp.

---

### 4.6 Alternativa: testar pelo Swagger (manual)

Útil para validar o WPPConnect antes de usar o sistema.

**Acesse:** http://localhost:21465/api-docs

#### Gerar o token

Procure: `POST /api/{session}/{secretKey}/generate-token`

| Campo | Valor |
|-------|-------|
| session | `hsa-serralheria` |
| secretKey | `hsa-chave-123` |

Execute e copie o valor do campo **`full`**.

#### Autorizar no Swagger

1. Clique em **Authorize** (cadeado no topo)
2. Cole o valor do campo `full`
3. **Authorize** → **Close**

#### Iniciar a sessão

Procure: `POST /api/{session}/start-session`

| Campo | Valor |
|-------|-------|
| session | `hsa-serralheria` |

Execute — o QR Code pode aparecer no **terminal do PowerShell** onde o `node server.js` está rodando.

#### Escanear o QR Code

No celular:

1. WhatsApp → **⋮** (3 pontinhos) → **Dispositivos conectados**
2. **Conectar dispositivo**
3. Aponte para o QR Code (tela do sistema ou terminal)

#### Testar envio de mensagem

Procure: `POST /api/{session}/send-message`

```json
{
  "phone": "5544999990000",
  "message": "Teste HSA Serralheria ✅",
  "isGroup": false
}
```

Substitua o telefone pelo número real (DDI 55 + DDD + número, sem espaços).

**Se a mensagem chegar no WhatsApp, o WPPConnect está funcionando.**

---

### 4.7 Enviar orçamento pelo HSA

1. WPPConnect **conectado** (status verde em Configurações → WhatsApp)
2. Acesse **Cotações**, expanda um orçamento
3. Clique em **Enviar WhatsApp**

O backend gera o PDF (JasperReports), converte para Base64 e envia via `send-file-base64` do WPPConnect.

> Apenas **Admin** e **Gerente** podem enviar (restrição no backend).

---

## 5. Ordem de inicialização (resumo)

```
1. PostgreSQL (serviço rodando)
2. WPPConnect  →  node C:\wppconnect\server.js
3. Backend     →  mvn spring-boot:run  (pasta Backend)
4. Frontend    →  npm start            (pasta Frontend)
5. Login       →  heitor@local.dev / 123
6. WhatsApp    →  Configurações → WhatsApp → Conectar
```

---

## 6. Problemas comuns

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| Status **offline** na aba WhatsApp | WPPConnect não está rodando | Suba `node server.js` na porta 21465 |
| **Token não configurado** ao enviar | Backend subiu antes do WPPConnect | Reinicie o backend com WPPConnect online |
| QR Code expira | Tempo limite de 60s | Clique em **Gerar novo QR Code** |
| Envio retorna **403** | Usuário é Funcionário | Use conta Admin ou Gerente |
| Erro de login no backend | Postgres parado ou senha errada | Verifique `application-local.properties` |
| Frontend não acha API | Backend parado | Confirme `http://localhost:8080` |

---

## 7. Estrutura do projeto

```
EstudoLojaVitual/
├── Backend/          # API Java (controllers, services, entities)
├── Frontend/         # Interface React
└── README.md         # Este arquivo
```

---

## 8. Variáveis de ambiente (referência)

**Backend** — `application.properties` + `application-local.properties`:

```properties
wppconnect.url=http://localhost:21465
wppconnect.sessao=hsa-serralheria
wppconnect.secretkey=hsa-chave-123
```

**Frontend** — `.env` ou `.env.development`:

```
REACT_APP_API_URL=http://localhost:8080/api
```

> Não commite arquivos com senhas (`.env`, `application-local.properties`).
