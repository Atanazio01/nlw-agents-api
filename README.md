# NLW Agents API

API desenvolvida durante o evento **NLW Agents** da [Rocketseat](https://rocketseat.com.br/).

## 🛠️ Tecnologias Utilizadas

### Runtime e Linguagem

- **Node.js** com TypeScript nativo (usando `--experimental-strip-types`)
- **TypeScript** 5.8+ para tipagem estática

### Framework e Bibliotecas Principais

- **Fastify** - Framework web rápido e eficiente
- **Fastify Type Provider Zod** - Integração entre Fastify e Zod para validação
- **Zod** - Validação de dados e schemas TypeScript-first
- **@fastify/cors** - Middleware de CORS

### Banco de Dados

- **PostgreSQL** com extensão **pgvector** para operações com vetores
- **Drizzle ORM** - ORM TypeScript-first para queries type-safe
- **postgres** - Driver PostgreSQL para Node.js

### Ferramentas de Desenvolvimento

- **Drizzle Kit** - CLI para migrations e introspection do banco
- **Biome** - Linter e formatter ultra-rápido
- **Ultracite** - Regras de linting personalizadas
- **Docker Compose** - Orquestração do ambiente de desenvolvimento

## 🏗️ Padrões de Projeto

### Arquitetura

- **Layered Architecture** - Separação em camadas (HTTP routes, database, env)
- **Environment Variables** - Configuração via variáveis de ambiente com validação Zod
- **Type-safe Database** - Uso do Drizzle ORM para queries 100% tipadas

### Estrutura de Pastas

```
src/
├── db/              # Camada de banco de dados
│   ├── schema/      # Definições de tabelas
│   ├── migrations/  # Migrations do banco
│   └── seed.ts      # Dados iniciais
├── http/
│   └── routes/      # Definições de rotas HTTP
├── env.ts           # Configuração de ambiente
└── server.ts        # Servidor principal
```

## 🚀 Setup e Configuração

### Pré-requisitos

- Node.js 20.6+
- Docker e Docker Compose

### 1. Clone o repositório

```bash
git clone <repository-url>
cd nlw-agents-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/agents
```

### 4. Inicie o banco de dados

```bash
docker-compose up -d
```

### 5. Execute as migrations

```bash
npx drizzle-kit migrate
```

### 6. Popule o banco com dados iniciais (opcional)

```bash
npm run db:seed
```

### 7. Inicie o servidor

```bash
# Modo desenvolvimento (watch mode)
npm run dev

# Modo produção
npm start
```

O servidor estará disponível em `http://localhost:3333`

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `npm start` - Inicia o servidor em modo produção
- `npm run db:seed` - Popula o banco com dados iniciais
- `npx drizzle-kit generate` - Gera novas migrations
- `npx drizzle-kit migrate` - Executa migrations pendentes
- `npx drizzle-kit studio` - Abre o Drizzle Studio para visualizar dados

## 🐳 Docker

O projeto inclui um `docker-compose.yml` configurado com:

- PostgreSQL 17 com extensão pgvector
- Banco de dados `agents`
- Usuário: `docker` / Senha: `docker`
- Porta: `5432`

## 🔍 Health Check

Acesse `GET /health` para verificar se a API está funcionando corretamente.
