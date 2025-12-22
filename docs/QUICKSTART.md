# ⚡ Quick Start - Frontend

Guia rápido para colocar o frontend funcionando em **5 minutos**.

## 📋 Pré-requisitos

- ✅ Node.js 18+ instalado
- ✅ Backend rodando (veja `/backend/README.md`)
- ✅ Banco de dados populado com seed

## 🚀 Instalação Rápida

### 1. Abra o terminal na pasta frontend

```powershell
cd "d:\portifolios\Sistema de gerenciamento\frontend"
```

### 2. Instale as dependências

```powershell
npm install
```

Isso vai instalar:
- Next.js 14
- React 18
- Tailwind CSS
- TypeScript
- Axios, Zustand, React Hook Form, Zod
- E todas as outras dependências

⏱️ **Tempo:** ~2 minutos

### 3. Verifique as variáveis de ambiente

O arquivo `.env.local` já está configurado:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME=Salão de Beleza
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ **Não precisa alterar nada se o backend está em `localhost:4000`**

### 4. Inicie o servidor de desenvolvimento

```powershell
npm run dev
```

O servidor vai iniciar em: **http://localhost:3000**

⏱️ **Tempo:** 10 segundos

### 5. Acesse no navegador

```
http://localhost:3000
```

Você será redirecionado para `/login`

## 🔐 Login

Use uma das credenciais de teste (do seed do backend):

### Admin (acesso total)
```
Email:    admin@salao.com
Senha:    admin123
```

### Recepção (agendamentos e clientes)
```
Email:    recepcao@salao.com
Senha:    reception123
```

### Profissional (visualização)
```
Email:    maria@salao.com
Senha:    staff123
```

## ✅ Pronto!

Após o login, você terá acesso a:

### 📊 Dashboard
- Estatísticas do dia
- Receita atual
- Próximos agendamentos
- Alertas

### 📅 Agendamentos
- Criar novo agendamento
- Ver calendário
- Filtrar por data/status
- Cancelar ou marcar no-show

### 👥 Clientes
- Listar todos os clientes
- Cadastrar novos
- Ver histórico completo
- Editar informações

### 💇 Serviços
- Gerenciar serviços oferecidos
- Definir preços e durações
- Categorizar serviços

### 👨‍💼 Profissionais
- Gerenciar equipe
- Definir especialidades
- Configurar horários

### 💰 Financeiro
- Registrar pagamentos
- Ver pendências
- Controlar despesas

### 📦 Produtos
- Gerenciar estoque
- Alertas de produtos em falta
- Registrar vendas (PDV)

---

## 🛠️ Comandos Úteis

```powershell
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Produção
npm run build            # Gera build otimizado
npm run start            # Inicia servidor de produção

# Qualidade
npm run lint             # Verifica erros de código
```

---

## 🐛 Problemas Comuns

### Erro: "Cannot connect to API"
- ✅ Certifique-se que o backend está rodando em `localhost:4000`
- ✅ Verifique o `NEXT_PUBLIC_API_URL` no `.env.local`

### Erro: "Invalid credentials"
- ✅ Certifique-se que executou o seed do backend (`npm run prisma:seed`)
- ✅ Use as credenciais exatas (case-sensitive)

### Página em branco
- ✅ Limpe o cache do navegador (Ctrl+Shift+Delete)
- ✅ Recarregue com Ctrl+F5

### Erro de módulos
- ✅ Delete a pasta `node_modules`
- ✅ Delete `package-lock.json`
- ✅ Execute `npm install` novamente

---

## 📱 Navegação

### Menu Lateral (Sidebar)
- Clique nos ícones para navegar
- Clique no ícone de menu (☰) para expandir/colapsar

### Usuário (Header)
- Clique no avatar para ver opções
- "Meu Perfil" para editar dados
- "Sair" para fazer logout

### Tema
- Clique no ícone ☀️/🌙 para alternar entre claro/escuro

---

## 🎯 Próximos Passos

1. ✅ Explore o Dashboard
2. ✅ Crie um cliente de teste
3. ✅ Crie um serviço
4. ✅ Faça um agendamento
5. ✅ Registre um pagamento

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- `README.md` - Visão geral e features
- `DOCUMENTACAO_COMPLETA.md` - Guia completo
- `/backend/docs/` - Documentação do backend

---

**Divirta-se explorando o sistema! 🎉**

Se tiver dúvidas, verifique os logs do console do navegador (F12).
