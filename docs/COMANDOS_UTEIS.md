# 🚀 Guia Rápido - Comandos Úteis

Comandos essenciais para trabalhar com o Sistema de Relatórios.

---

## 📦 Instalação e Setup

### Instalar Dependências
```bash
npm install
# ou
yarn install
```

### Verificar Dependências do Sistema de Relatórios
```bash
npm list recharts swr lucide-react
```

### Configurar Environment Variables
```bash
# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1" > .env.local
```

---

## 🏃 Desenvolvimento

### Iniciar Servidor de Desenvolvimento
```bash
npm run dev
# Acesse: http://localhost:3000
```

### Build de Produção
```bash
npm run build
```

### Iniciar em Modo Produção
```bash
npm run start
```

### Verificar Erros TypeScript
```bash
npx tsc --noEmit
```

### Verificar Linting
```bash
npm run lint
```

---

## 🧪 Navegação Rápida

### URLs das Páginas

```bash
# Dashboard Principal
http://localhost:3000/dashboard/reports

# Relatórios Financeiros
http://localhost:3000/dashboard/reports/financial

# Relatórios de Agendamentos
http://localhost:3000/dashboard/reports/appointments

# Relatórios de Produtos
http://localhost:3000/dashboard/reports/products

# Relatórios de Clientes
http://localhost:3000/dashboard/reports/clients

# Relatórios de Comissões
http://localhost:3000/dashboard/reports/commissions
```

---

## 🔍 Debug e Testes

### Ver Logs do Next.js
```bash
# No terminal onde rodou npm run dev
# Logs aparecem automaticamente
```

### Testar Endpoints da API
```bash
# Dashboard
curl http://localhost:4000/api/v1/reports/dashboard?startDate=2025-01-01&endDate=2025-12-31

# Receita
curl http://localhost:4000/api/v1/reports/financial/revenue?startDate=2025-01-01&endDate=2025-12-31

# Métodos de Pagamento
curl http://localhost:4000/api/v1/reports/financial/payment-methods?startDate=2025-01-01&endDate=2025-12-31

# Agendamentos
curl http://localhost:4000/api/v1/reports/appointments/stats?startDate=2025-01-01&endDate=2025-12-31

# Produtos
curl http://localhost:4000/api/v1/reports/products/top-selling?startDate=2025-01-01&endDate=2025-12-31

# Clientes
curl http://localhost:4000/api/v1/reports/clients/analysis?startDate=2025-01-01&endDate=2025-12-31

# Comissões
curl http://localhost:4000/api/v1/reports/commissions?startDate=2025-01-01&endDate=2025-12-31
```

### Limpar Cache do Next.js
```bash
rm -rf .next
npm run dev
```

### Limpar node_modules
```bash
rm -rf node_modules
npm install
```

---

## 📁 Estrutura de Arquivos

### Ver Estrutura do Projeto
```bash
# PowerShell
tree /f src\app\dashboard\reports
tree /f src\components\charts
tree /f src\components\reports

# Git Bash / Unix
find src/app/dashboard/reports -type f
find src/components/charts -type f
find src/components/reports -type f
```

### Contar Linhas de Código
```bash
# PowerShell
(Get-ChildItem -Path "src\app\dashboard\reports" -Recurse -Include *.tsx | Get-Content | Measure-Object -Line).Lines

# Git Bash / Unix
find src/app/dashboard/reports -name "*.tsx" | xargs wc -l
```

---

## 🔧 Manutenção

### Atualizar Dependências
```bash
# Verificar atualizações
npm outdated

# Atualizar dependências
npm update

# Atualizar dependência específica
npm install recharts@latest
npm install swr@latest
```

### Adicionar Nova Dependência
```bash
npm install nome-do-pacote
# ou
yarn add nome-do-pacote
```

---

## 📝 Git

### Commit das Mudanças
```bash
git add .
git commit -m "feat: implementa sistema completo de relatórios"
git push origin main
```

### Ver Status
```bash
git status
```

### Ver Diferenças
```bash
git diff
```

### Criar Branch
```bash
git checkout -b feature/reports-system
```

---

## 🐛 Solução de Problemas

### Erro: Cannot find module
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: Port 3000 already in use
```bash
# PowerShell - Matar processo na porta 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Git Bash / Unix
lsof -ti:3000 | xargs kill -9
```

### Erro: TypeScript
```bash
# Verificar erros
npx tsc --noEmit

# Limpar cache do TypeScript
rm -rf .next
npm run dev
```

### Erro: Module not found '@/...'
```bash
# Verificar tsconfig.json
# Deve ter:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Erro: API não responde
```bash
# Verificar se backend está rodando
curl http://localhost:4000/api/v1/health

# Verificar .env.local
cat .env.local

# Verificar CORS no backend
# Headers devem permitir localhost:3000
```

---

## 📊 Análise de Performance

### Bundle Analyzer
```bash
# Instalar
npm install --save-dev @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... suas configurações
})

# Rodar análise
ANALYZE=true npm run build
```

### Lighthouse CI
```bash
# Instalar
npm install -g @lhci/cli

# Rodar
lhci autorun --collect.url=http://localhost:3000/dashboard/reports
```

---

## 📚 Documentação Rápida

### Abrir Documentação
```bash
# Windows
start docs\REPORTS_README.md

# Mac
open docs/REPORTS_README.md

# Linux
xdg-open docs/REPORTS_README.md
```

### Documentos Principais
```bash
docs/REPORTS_README.md                  # Guia principal
docs/REPORTS_API_EXAMPLES.md            # Exemplos de API
docs/IMPLEMENTACAO_COMPLETA.md          # Resumo completo
docs/CHECKLIST_VERIFICACAO.md           # Checklist de testes
docs/GUIA_COMPLETAR_PAGINAS.md          # Guia de desenvolvimento
```

---

## 🚀 Deploy

### Vercel
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Netlify
```bash
# Instalar CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy para produção
netlify deploy --prod
```

### Docker
```bash
# Build
docker build -t salon-reports .

# Run
docker run -p 3000:3000 salon-reports
```

---

## 🔐 Environment Variables

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Production
```bash
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
```

### Verificar Variables
```bash
# PowerShell
Get-Content .env.local

# Git Bash / Unix
cat .env.local
```

---

## 📈 Monitoramento

### Ver Logs em Tempo Real
```bash
# Development
npm run dev
# Logs aparecem no terminal

# Production (Vercel)
vercel logs
```

### Sentry (Error Tracking)
```bash
# Instalar
npm install @sentry/nextjs

# Configurar
npx @sentry/wizard -i nextjs
```

---

## 🎯 Comandos Mais Usados

```bash
# Top 5
npm run dev              # Desenvolvimento
npm run build           # Build
npm run start           # Produção
npm run lint            # Linting
npx tsc --noEmit        # TypeScript check
```

---

## 💡 Dicas Úteis

### VS Code
```bash
# Abrir projeto
code .

# Abrir arquivo específico
code src/app/dashboard/reports/page.tsx
```

### Hot Reload
```bash
# Já funciona automaticamente no npm run dev
# Salve o arquivo e a página recarrega
```

### Debug no Browser
```bash
# Abrir DevTools
F12 ou Ctrl+Shift+I

# Network Tab - Ver requests
# Console - Ver logs
# React DevTools - Inspecionar componentes
```

---

## 🔄 Scripts Customizados (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "clean": "rm -rf .next node_modules"
  }
}
```

---

## 📞 Ajuda Rápida

### Next.js
```bash
npx next --help
```

### NPM
```bash
npm help
```

### TypeScript
```bash
npx tsc --help
```

---

**Sistema de Relatórios - Guia Rápido de Comandos**  
**Mantenha este arquivo à mão para referência rápida! 📖**
