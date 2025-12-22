# 🚀 Instalação Completa - Do Zero ao Funcionamento

Este guia vai te levar de **zero a um sistema completo funcionando** em aproximadamente **15 minutos**.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **Editor de código** (VS Code recomendado)

### Opcional (mas recomendado):
- Redis (para filas) - [Download](https://redis.io/download)
- Docker Desktop (alternativa) - [Download](https://www.docker.com/products/docker-desktop/)

---

## 🎯 Opção 1: Instalação com Docker (Mais Fácil)

### 1. Clone o repositório

```powershell
git clone <url-do-repositorio>
cd "Sistema de gerenciamento"
```

### 2. Configure o backend

```powershell
cd backend
cp .env.example .env
```

Edite o `.env` (mantenha os valores padrão se for usar Docker):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/salao_db"
JWT_SECRET="seu-secret-super-secreto-aqui"
JWT_REFRESH_SECRET="outro-secret-aqui"
```

### 3. Inicie tudo com Docker

```powershell
docker-compose up -d
```

Isso vai iniciar:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- API Backend (porta 4000)

### 4. Execute as migrations e seed

```powershell
npm install
npm run prisma:migrate
npm run prisma:seed
```

✅ Backend pronto!

### 5. Configure e inicie o frontend

```powershell
cd ../frontend
npm install
npm run dev
```

✅ Frontend rodando em `http://localhost:3000`

---

## 🎯 Opção 2: Instalação Manual (Mais Controle)

### Passo 1: Configure o PostgreSQL

#### A. Crie o banco de dados

Abra o PostgreSQL (psql ou pgAdmin) e execute:

```sql
CREATE DATABASE salao_db;
CREATE USER salao_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE salao_db TO salao_user;
```

#### B. Anote a connection string

```
postgresql://salao_user:sua_senha_aqui@localhost:5432/salao_db
```

---

### Passo 2: Configure o Backend

#### A. Entre na pasta

```powershell
cd backend
```

#### B. Instale as dependências

```powershell
npm install
```

⏱️ Tempo: ~2 minutos

#### C. Configure as variáveis de ambiente

```powershell
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Database
DATABASE_URL="postgresql://salao_user:sua_senha_aqui@localhost:5432/salao_db"

# JWT
JWT_SECRET="gere-um-secret-forte-aqui-use-um-gerador"
JWT_REFRESH_SECRET="outro-secret-diferente"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"

# Redis (opcional, para notificações)
REDIS_URL="redis://localhost:6379"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu_email@gmail.com"
SMTP_PASS="sua_senha_de_app"

# WhatsApp (opcional)
WHATSAPP_API_URL=""
WHATSAPP_API_KEY=""
```

💡 **Dica:** Para gerar secrets fortes:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### D. Execute as migrations

```powershell
npm run prisma:generate
npm run prisma:migrate
```

Isso vai:
- Gerar o Prisma Client
- Criar todas as tabelas no banco
- Aplicar constraints e índices

⏱️ Tempo: ~1 minuto

#### E. Popule o banco com dados de teste

```powershell
npm run prisma:seed
```

Isso cria:
- 3 roles (Admin, Recepção, Staff)
- 38 permissões
- 5 usuários de teste
- 2 profissionais
- 10 clientes
- 5 serviços
- Alguns agendamentos de exemplo

⏱️ Tempo: ~30 segundos

#### F. Inicie o servidor

```powershell
npm run dev
```

✅ **Backend rodando em:** `http://localhost:4000`

Teste acessando:
```
http://localhost:4000/health
```

Deve retornar: `{"status":"ok"}`

---

### Passo 3: Configure o Frontend

#### A. Abra um NOVO terminal e entre na pasta

```powershell
cd frontend
```

#### B. Instale as dependências

```powershell
npm install
```

⏱️ Tempo: ~2 minutos

#### C. Verifique o .env.local

O arquivo `.env.local` já existe e está configurado:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME=Salão de Beleza
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ Não precisa alterar nada!

#### D. Inicie o servidor

```powershell
npm run dev
```

✅ **Frontend rodando em:** `http://localhost:3000`

---

## 🎉 Acesse o Sistema

### 1. Abra o navegador

```
http://localhost:3000
```

Você será redirecionado para `/login`

### 2. Faça login com uma das contas de teste

**Admin (acesso total):**
```
Email:    admin@salao.com
Senha:    admin123
```

**Recepção (agendamentos e clientes):**
```
Email:    recepcao@salao.com
Senha:    reception123
```

**Profissional (apenas visualização):**
```
Email:    maria@salao.com
Senha:    staff123
```

### 3. Explore!

Após o login, você terá acesso ao dashboard com:
- 📊 Estatísticas em tempo real
- 📅 Próximos agendamentos
- 👥 Gestão de clientes
- 💰 Controle financeiro
- E muito mais!

---

## ✅ Checklist de Verificação

### Backend
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `salao_db` criado
- [ ] Dependências instaladas (`node_modules/`)
- [ ] `.env` configurado
- [ ] Migrations executadas (17 tabelas criadas)
- [ ] Seed executado (dados de teste inseridos)
- [ ] Servidor rodando em `localhost:4000`
- [ ] Health check respondendo

### Frontend
- [ ] Dependências instaladas
- [ ] `.env.local` configurado
- [ ] Servidor rodando em `localhost:3000`
- [ ] Página de login carregando
- [ ] Login funcionando
- [ ] Dashboard renderizando dados

---

## 🐛 Problemas Comuns

### 1. "Cannot connect to database"

**Causa:** PostgreSQL não está rodando ou credenciais erradas.

**Solução:**
```powershell
# Verifique se o PostgreSQL está rodando
# Windows:
services.msc  # Procure por PostgreSQL

# Teste a conexão:
psql -U salao_user -d salao_db
```

### 2. "Port 4000 already in use"

**Causa:** Outra aplicação usando a porta.

**Solução:**
```powershell
# Encontre e mate o processo
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Ou altere a porta no .env:
PORT=4001
```

### 3. "Prisma Client not generated"

**Causa:** Esqueceu de gerar o client.

**Solução:**
```powershell
npm run prisma:generate
```

### 4. "CORS error" no frontend

**Causa:** Backend não aceita requisições do frontend.

**Solução:**
```env
# No backend .env
CORS_ORIGIN="http://localhost:3000"
```

### 5. "Module not found" no frontend

**Causa:** Dependências não instaladas.

**Solução:**
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Resetar o Sistema

Se quiser começar do zero novamente:

### Backend

```powershell
cd backend

# Limpa o banco
npm run prisma:migrate:reset

# Recria tudo
npm run prisma:migrate
npm run prisma:seed
```

### Frontend

```powershell
cd frontend

# Limpa cache
rm -rf .next node_modules
npm install
```

---

## 📊 Próximos Passos

Agora que está tudo funcionando:

1. ✅ Explore todas as funcionalidades
2. ✅ Crie seus próprios dados
3. ✅ Customize o tema
4. ✅ Adicione seu logo
5. ✅ Configure WhatsApp/Email (opcional)
6. ✅ Configure pagamentos (opcional)
7. ✅ Deploy em produção

---

## 🚀 Deploy em Produção

### Frontend (Vercel)

1. Crie uma conta em [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL=https://sua-api.com/api/v1`
4. Deploy automático!

### Backend (Railway/Render)

1. Crie uma conta em [railway.app](https://railway.app) ou [render.com](https://render.com)
2. Crie um novo projeto PostgreSQL
3. Crie um novo projeto Node.js
4. Configure as variáveis de ambiente
5. Deploy!

### Database (Supabase)

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a `DATABASE_URL`
4. Execute as migrations

---

## 📚 Documentação Adicional

- **Backend:** `/backend/README.md`
- **Frontend:** `/frontend/README.md`
- **Quick Start:** `/frontend/QUICKSTART.md`
- **Integração:** `/INTEGRACAO_FRONTEND_BACKEND.md`
- **API Docs:** `/backend/docs/ROUTES.md`

---

## 💬 Suporte

Se tiver problemas:

1. Verifique os logs do console (F12 no navegador)
2. Verifique os logs do terminal do backend
3. Consulte a documentação
4. Revise este guia

---

## 🎉 Parabéns!

Você agora tem um **sistema completo de gerenciamento** rodando!

**Tempo total:** ~15 minutos

**O que você tem:**
- ✅ Backend profissional com API REST
- ✅ Frontend moderno e responsivo
- ✅ Banco de dados estruturado
- ✅ Sistema de autenticação
- ✅ Controle de permissões
- ✅ CRM completo
- ✅ Gestão de agendamentos
- ✅ Controle financeiro
- ✅ Gestão de estoque
- ✅ E muito mais!

**Boa sorte com seu salão! 💇‍♀️💅✨**
