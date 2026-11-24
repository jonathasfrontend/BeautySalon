'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, FolderTree, Landmark, Settings, Truck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { EmptyState } from '@/components/finance/common/EmptyState';

const CARDS = [
  {
    href: '/financeiro/cadastros/contas-bancarias',
    label: 'Contas bancárias',
    description: 'Saldo inicial, dados bancários e saldos calculados',
    Icon: Landmark,
    permission: 'finance.catalog.manage',
  },
  {
    href: '/financeiro/cadastros/categorias',
    label: 'Categorias',
    description: 'Categorias de entrada e saída, com cores e hierarquia',
    Icon: FolderTree,
    permission: 'finance.catalog.manage',
  },
  {
    href: '/financeiro/cadastros/maquininhas',
    label: 'Maquininhas',
    description: 'Adquirentes, taxas de débito/crédito e prazos de liquidação',
    Icon: CreditCard,
    permission: 'finance.catalog.manage',
  },
  {
    href: '/financeiro/cadastros/fornecedores',
    label: 'Fornecedores',
    description: 'Contatos dos fornecedores das despesas',
    Icon: Truck,
    permission: 'finance.catalog.manage',
  },
  {
    href: '/financeiro/cadastros/configuracoes',
    label: 'Configurações',
    description: 'Tolerância de fechamento, janela de conciliação e alertas',
    Icon: Settings,
    permission: 'finance.settings',
  },
];

export default function CadastrosPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canManage = permissions.includes('finance.catalog.manage');
  const canSettings = permissions.includes('finance.settings');
  const allowed = canManage || canSettings;

  useEffect(() => {
    if (!allowed) router.push('/dashboard');
  }, [allowed, router]);

  if (!allowed) return null;

  const visible = CARDS.filter((card) => permissions.includes(card.permission));

  if (visible.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <EmptyState
          Icon={Settings}
          title="Sem acesso a cadastros"
          description="Peça a um administrador para liberar a gestão do catálogo financeiro."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Cadastros financeiros</h2>
        <p className="text-sm text-muted-foreground">
          Base de dados do módulo: contas, categorias, adquirentes e regras
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((card) => (
          <button
            key={card.href}
            type="button"
            onClick={() => router.push(card.href)}
            className="bg-card group rounded-lg border border-border p-5 text-left transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <span className="inline-flex rounded-lg bg-primary/10 p-2">
              <card.Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <span className="mt-3 block font-medium text-foreground group-hover:text-primary">
              {card.label}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {card.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
