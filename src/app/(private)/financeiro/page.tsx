'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock,
  EyeOff,
  Landmark,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useFinanceOverview } from '@/hooks/useFinance';
import StatCard from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { ErrorState } from '@/components/finance/common/ErrorState';
import { errorMessage } from '@/lib/error';
import { formatBRL } from '@/lib/money';

type PeriodPreset = 'this-month' | 'last-month' | 'last-7-days' | 'last-30-days';

const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: 'this-month', label: 'Este mês' },
  { value: 'last-month', label: 'Mês passado' },
  { value: 'last-7-days', label: 'Últimos 7 dias' },
  { value: 'last-30-days', label: 'Últimos 30 dias' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Período local em YYYY-MM-DD (sem fuso na leitura do backend — spec §10.2). */
function periodRange(preset: PeriodPreset): { from: string; to: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (preset) {
    case 'last-month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: key(start), to: key(end) };
    }
    case 'last-7-days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { from: key(start), to: key(today) };
    }
    case 'last-30-days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { from: key(start), to: key(today) };
    }
    default: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: key(start), to: key(today) };
    }
  }
}

/** Primeira aba permitida — usado quando o usuário não tem finance.dashboard. */
function firstAllowedTab(permissions: string[]): string | null {
  const has = (p: string) => permissions.includes(p);
  if (has('finance.dashboard')) return null; // fica na visão geral
  if (has('finance.cash.operate') || has('finance.cash.view-all')) return '/financeiro/caixa';
  if (has('finance.payables.list')) return '/financeiro/a-pagar';
  if (has('finance.receivables.list')) return '/financeiro/a-receber';
  if (has('finance.catalog.manage') || has('finance.settings')) return '/financeiro/cadastros';
  return '/dashboard';
}

export default function FinanceiroHomePage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canView = permissions.includes('finance.dashboard');

  const [preset, setPreset] = useState<PeriodPreset>('this-month');
  const range = useMemo(() => periodRange(preset), [preset]);
  const { data, error, isLoading, refresh } = useFinanceOverview(range);

  useEffect(() => {
    if (canView) return;
    const target = firstAllowedTab(permissions);
    if (target) router.push(target);
  }, [canView, permissions, router]);

  if (!canView) return null;

  const accountCount = data?.bankBalances.accounts.length ?? 0;
  const openSessions = data?.cash.sessions ?? [];
  const overdueCount = data?.alerts.overdueExpenses ?? 0;
  const receivableTotal =
    (data?.receivables.cardThisMonth ?? 0) + (data?.receivables.pendingPayments ?? 0);

  const alerts: { icon: typeof Clock; text: string }[] = [];
  if (data) {
    if (data.alerts.overdueExpenses > 0) {
      alerts.push({
        icon: AlertTriangle,
        text: `${data.alerts.overdueExpenses} ${
          data.alerts.overdueExpenses === 1 ? 'conta vencida' : 'contas vencidas'
        }`,
      });
    }
    if (data.alerts.cashOpenOver24h > 0) {
      alerts.push({
        icon: Clock,
        text: `${data.alerts.cashOpenOver24h} caixa aberto há mais de 24 h`,
      });
    }
    if (data.alerts.overdueCardReceivables > 0) {
      alerts.push({
        icon: EyeOff,
        text: `${data.alerts.overdueCardReceivables} recebível de cartão vencido não conciliado`,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Visão geral</h2>
            <p className="text-sm text-muted-foreground">
              {range.from.split('-').reverse().join('/')} — {range.to.split('-').reverse().join('/')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <label htmlFor="finance-period" className="sr-only">
            Período
          </label>
          <select
            id="finance-period"
            value={preset}
            onChange={(event) => setPreset(event.target.value as PeriodPreset)}
            className="h-10 rounded-md border border-input bg-muted px-3 text-sm text-foreground"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={isLoading}
            aria-label="Atualizar visão geral"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {isLoading && !data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg border border-border bg-card"
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-card rounded-lg border border-border">
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar a visão geral')}
            onRetry={() => refresh()}
          />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Saldo em contas"
              value={formatBRL(data.bankBalances.total)}
              icon={Landmark}
              change={`${accountCount} ${accountCount === 1 ? 'conta' : 'contas'}`}
            />
            <StatCard
              title="Caixa"
              value={
                openSessions.length > 0
                  ? formatBRL(openSessions[0].expectedCash ?? 0)
                  : 'Fechado'
              }
              icon={Banknote}
              change={
                openSessions.length > 0
                  ? `Aberto · ${openSessions[0].registerName}`
                  : 'Nenhuma sessão aberta'
              }
              changeType={openSessions.length > 0 ? 'positive' : 'neutral'}
            />
            <StatCard
              title="A pagar (7 dias)"
              value={formatBRL(data.payables.next7Days)}
              icon={ArrowUpRight}
              change={overdueCount > 0 ? `⚠ ${overdueCount} vencidas` : 'Nenhuma vencida'}
              changeType={overdueCount > 0 ? 'negative' : 'positive'}
            />
            <StatCard
              title="A receber"
              value={formatBRL(receivableTotal)}
              icon={ArrowDownLeft}
              change={`Cartão: ${formatBRL(data.receivables.cardThisMonth)}`}
              changeType="neutral"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="bg-card rounded-lg border border-border p-5 lg:col-span-2">
              <h3 className="font-semibold text-foreground">Entradas × Saídas</h3>
              <p className="text-sm text-muted-foreground">
                Período selecionado — pagamentos confirmados e despesas pagas
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ArrowDownLeft
                      className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    Entradas
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    <MoneyText value={data.flows.inflows} colored />
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ArrowUpRight
                      className="h-4 w-4 text-rose-600 dark:text-rose-400"
                      aria-hidden="true"
                    />
                    Saídas
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    <MoneyText value={data.flows.outflows} colored />
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
                    Saldo do período
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    <MoneyText value={data.flows.net} colored signed />
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-lg border border-border p-5">
              <h3 className="font-semibold text-foreground">Alertas</h3>
              {alerts.length === 0 ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  Nenhum alerta no momento
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {alerts.map((alert, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <alert.icon
                        className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                        aria-hidden="true"
                      />
                      {alert.text}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
