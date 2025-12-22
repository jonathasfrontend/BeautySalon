# 🎨 Sistema de Gerenciamento para Salão - Frontend

Frontend moderno e responsivo construído com **React**, **Next.js 14**, **TypeScript** e **Tailwind CSS**.

## ✨ Características

- ⚡ **Next.js 14** com App Router e Server Components
- 🎨 **Tailwind CSS** para estilização moderna e responsiva
- 📘 **TypeScript** com tipagem estrita
- 🔐 **Autenticação JWT** com refresh token automático
- 🎯 **Sistema de Permissões** baseado em roles
- 📊 **Dashboard** com métricas e gráficos
- 🎭 **Tema Dark/Light** alternável
- 📱 **100% Responsivo** para mobile, tablet e desktop
- ⚡ **Performance otimizada** com SSR e SWR para cache
- 🎉 **UX/UI moderna** inspirada em plataformas financeiras

## 🚀 Tecnologias Principais

```json
{
  "framework": "Next.js 14",
  "linguagem": "TypeScript 5.3",
  "estilização": "Tailwind CSS 3.3",
  "gerenciamento-estado": "Zustand",
  "formulários": "React Hook Form + Zod",
  "requisições": "Axios + SWR",
  "ícones": "Lucide React",
  "gráficos": "Recharts",
  "notificações": "React Hot Toast"
}
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                      # App Router (Next.js 14)
│   │   ├── dashboard/            # Páginas do dashboard
│   │   │   ├── appointments/     # Módulo de agendamentos
│   │   │   ├── clients/          # Módulo de clientes
│   │   │   ├── staff/            # Módulo de profissionais
│   │   │   ├── services/         # Módulo de serviços
│   │   │   ├── payments/         # Módulo financeiro
│   │   │   ├── products/         # Módulo de produtos/estoque
│   │   │   ├── reports/          # Relatórios
│   │   │   ├── settings/         # Configurações
│   │   │   └── layout.tsx        # Layout do dashboard
│   │   ├── login/                # Página de login
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── page.tsx              # Página inicial (redirect)
│   │   └── globals.css           # Estilos globais
│   ├── components/               # Componentes React
│   │   ├── layout/               # Componentes de layout
│   │   │   ├── Sidebar.tsx       # Menu lateral
│   │   │   └── Header.tsx        # Cabeçalho
│   │   └── ui/                   # Componentes reutilizáveis
│   │       ├── StatCard.tsx      # Card de estatística
│   │       ├── Modal.tsx         # Modal genérico
│   │       └── LoadingSpinner.tsx # Spinner de carregamento
│   ├── services/                 # Serviços de API
│   │   ├── auth.service.ts       # Autenticação
│   │   ├── client.service.ts     # Clientes
│   │   ├── appointment.service.ts # Agendamentos
│   │   ├── service.service.ts    # Serviços
│   │   ├── staff.service.ts      # Profissionais
│   │   ├── payment.service.ts    # Pagamentos
│   │   └── product.service.ts    # Produtos
│   ├── store/                    # Estado global (Zustand)
│   │   ├── auth.store.ts         # Store de autenticação
│   │   └── ui.store.ts           # Store de UI
│   ├── hooks/                    # Custom Hooks
│   │   └── useAuth.ts            # Hook de autenticação
│   ├── lib/                      # Utilitários
│   │   ├── api.ts                # Cliente Axios configurado
│   │   └── utils.ts              # Funções utilitárias
│   └── types/                    # Definições TypeScript
│       └── index.ts              # Tipos globais
├── public/                       # Arquivos estáticos
├── package.json
├── tsconfig.json                 # Configuração TypeScript
├── tailwind.config.ts            # Configuração Tailwind
├── next.config.js                # Configuração Next.js
└── .env.local                    # Variáveis de ambiente
```

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Backend rodando em `http://localhost:4000` (ou configure a URL no .env)

### Passo a Passo

1. **Entre na pasta do frontend**
```bash
cd frontend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite o .env.local se necessário
# NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:3000
```

## 🔐 Credenciais de Teste

Após fazer o seed do backend, use:

```
Admin:         admin@salao.com / admin123
Recepção:      recepcao@salao.com / reception123
Profissional:  maria@salao.com / staff123
```

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Produção
npm run build        # Gera build otimizado
npm run start        # Inicia servidor de produção

# Qualidade de código
npm run lint         # Executa o ESLint
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login com JWT
- [x] Refresh token automático
- [x] Proteção de rotas
- [x] Logout seguro
- [x] Persistência de sessão

### ✅ Dashboard
- [x] Estatísticas em tempo real
- [x] Cards de métricas
- [x] Próximos agendamentos
- [x] Alertas de pagamentos pendentes
- [x] Interface responsiva

### ✅ Sistema de Permissões
- [x] Controle baseado em roles
- [x] Menu dinâmico por permissões
- [x] Proteção de rotas por permissão
- [x] UI adaptável por cargo

### ✅ Módulos

#### Clientes
- [x] Listagem com paginação
- [x] Busca por nome/telefone/email
- [x] Cadastro de novos clientes
- [x] Edição de dados
- [x] Histórico completo
- [x] Lista de clientes inativos
- [x] Controle de fidelidade

#### Agendamentos
- [x] Calendário interativo
- [x] Criação de agendamentos
- [x] Verificação de disponibilidade
- [x] Agendamento de combos
- [x] Cancelamento
- [x] Marcar no-show
- [x] Filtros por data/status/profissional
- [x] Estatísticas de agendamentos

#### Serviços
- [x] CRUD completo
- [x] Categorização
- [x] Controle de duração e preço
- [x] Ativar/desativar serviços

#### Profissionais
- [x] Gestão de staff
- [x] Especialidades
- [x] Horários de trabalho
- [x] Sistema de comissões
- [x] Disponibilidade

#### Financeiro
- [x] Registro de pagamentos
- [x] Múltiplos métodos de pagamento
- [x] Controle de despesas
- [x] Relatórios financeiros
- [x] Confirmação de pagamentos

#### Produtos/Estoque
- [x] CRUD de produtos
- [x] Controle de estoque
- [x] Alertas de estoque baixo
- [x] Movimentações
- [x] Vendas (PDV)

## 🎨 Design System

### Cores Principais

```css
/* Primary (Blue) */
--primary-500: #0ea5e9
--primary-600: #0284c7
--primary-700: #0369a1

/* Secondary (Purple) */
--secondary-500: #d946ef
--secondary-600: #c026d3
```

### Componentes Reutilizáveis

- **Buttons**: primary, secondary, danger, success, outline
- **Inputs**: text, email, password, select, textarea
- **Cards**: stats, content, interactive
- **Modal**: responsivo com backdrop
- **Tables**: ordenáveis e filtráveis
- **Badges**: status coloridos

## 📱 Responsividade

- **Mobile**: 320px - 640px (sm)
- **Tablet**: 640px - 1024px (md/lg)
- **Desktop**: 1024px+ (xl/2xl)

Sidebar responsiva:
- Desktop: expandida (256px)
- Mobile: colapsada ou menu hambúrguer

## ⚡ Performance

- **Server-Side Rendering** para páginas estáticas
- **SWR** para cache e revalidação automática
- **Code splitting** automático do Next.js
- **Imagens otimizadas** com next/image
- **Lazy loading** de componentes pesados

## 🔒 Segurança

- Tokens armazenados no localStorage (HTTPOnly em produção)
- Refresh automático antes de expirar
- Logout automático em caso de token inválido
- Validação de inputs com Zod
- Sanitização de dados

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instale a Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Outras plataformas

O projeto pode ser deployado em:
- Netlify
- AWS Amplify
- Railway
- Render
- Qualquer serviço que suporte Next.js

### Variáveis de Ambiente (Produção)

```env
NEXT_PUBLIC_API_URL=https://sua-api.com/api/v1
NEXT_PUBLIC_APP_NAME=Salão de Beleza
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

## 📚 Documentação Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [SWR](https://swr.vercel.app/)

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ e Next.js 14**
