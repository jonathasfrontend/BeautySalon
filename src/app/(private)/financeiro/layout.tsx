'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { TabsNav, type FinanceTab } from '@/components/finance/common/TabsNav';

/**
 * Layout do módulo Financeiro (F1.8): guarda + abas secundárias.
 * Cada aba só aparece com a permissão correspondente (spec §10.1, tabela).
 * A API revalida sempre — isto é UX, não segurança (spec §10.5).
 */
export default function FinanceiroLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);

  const has = (permission: string) => permissions.includes(permission);
  const hasAnyFinance = permissions.some((permission) => permission.startsWith('finance.'));

  useEffect(() => {
    if (!hasAnyFinance) router.push('/dashboard');
  }, [hasAnyFinance, router]);

  const tabs: FinanceTab[] = [
    ...(has('finance.dashboard')
      ? [{ href: '/financeiro', label: 'Visão geral' }]
      : []),
    ...(has('finance.cash.operate') || has('finance.cash.view-all')
      ? [{ href: '/financeiro/caixa', label: 'Caixa' }]
      : []),
    ...(has('finance.payables.list')
      ? [{ href: '/financeiro/a-pagar', label: 'A pagar' }]
      : []),
    ...(has('finance.receivables.list')
      ? [{ href: '/financeiro/a-receber', label: 'A receber' }]
      : []),
    ...(has('finance.catalog.manage') || has('finance.settings')
      ? [{ href: '/financeiro/cadastros', label: 'Cadastros' }]
      : []),
  ];

  if (!hasAnyFinance) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground">
          Caixa, contas a pagar, a receber e cadastros do salão
        </p>
      </div>
      <TabsNav tabs={tabs} />
      {children}
    </div>
  );
}
