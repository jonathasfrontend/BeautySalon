'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowDownLeft, CreditCard, Plus, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCardReceivables, useReceivables } from '@/hooks/useFinance';
import { financeService } from '@/services/finance.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/finance/common/StatusBadge';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { EmptyState } from '@/components/finance/common/EmptyState';
import { ErrorState } from '@/components/finance/common/ErrorState';
import { ListPagination } from '@/components/finance/common/ListPagination';
import { TableSkeleton } from '@/components/finance/common/TableSkeleton';
import { errorMessage } from '@/lib/error';
import { formatDate, parseMoneyInput } from '@/lib/money';
import type { ReceivableStatus, UnifiedReceivable } from '@/types/finance';

type Tab = 'todos' | 'pendentes' | 'recebidos' | 'cartao';

const TABS = [
  { href: '/financeiro/a-receber?aba=todos', label: 'Todos' },
  { href: '/financeiro/a-receber?aba=pendentes', label: 'Pendentes' },
  { href: '/financeiro/a-receber?aba=recebidos', label: 'Recebidos' },
  { href: '/financeiro/a-receber?aba=cartao', label: 'Cartão' },
];

const STATUS_BY_TAB: Partial<Record<Tab, ReceivableStatus>> = {
  pendentes: 'PENDING',
  recebidos: 'PAID',
};

export default function AReceberPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canList = permissions.includes('finance.receivables.list');
  const canManage = permissions.includes('finance.catalog.manage');

  const [tab, setTab] = useState<Tab>('todos');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');

  // Aba via query (?aba=) mantém links/refresh previsíveis
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('aba');
    if (value && ['todos', 'pendentes', 'recebidos', 'cartao'].includes(value)) {
      setTab(value as Tab);
    }
  }, []);

  useEffect(() => {
    if (!canList) router.push('/dashboard');
  }, [canList, router]);

  const statusFilter = STATUS_BY_TAB[tab];
  const isCardTab = tab === 'cartao';

  const receivablesQuery = useMemo(
    () => ({
      page,
      limit,
      ...(statusFilter ? { status: statusFilter } : {}),
      sort: 'expectedDate:asc',
    }),
    [page, limit, statusFilter]
  );

  const {
    items,
    pagination,
    summary,
    error,
    isLoading,
    refresh,
  } = useReceivables(receivablesQuery);

  const card = useCardReceivables(
    isCardTab ? { page, limit, sort: 'expectedDate:asc' } : undefined
  );

  const [incomeOpen, setIncomeOpen] = useState(false);
  const [incomeDescription, setIncomeDescription] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState('');
  const [incomeNotes, setIncomeNotes] = useState('');
  const [incomeSubmitting, setIncomeSubmitting] = useState(false);
  const [incomeError, setIncomeError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.description.toLowerCase().includes(term) ||
        (item.clientName ?? '').toLowerCase().includes(term)
    );
  }, [items, search]);

  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  if (!canList) return null;

  const handleCreateIncome = async (event: FormEvent) => {
    event.preventDefault();
    setIncomeError(null);
    const cents = parseMoneyInput(incomeAmount);
    if (cents <= 0) {
      toast.error('Informe um valor maior que zero');
      return;
    }
    if (!incomeDate) {
      toast.error('Informe a data de recebimento');
      return;
    }
    setIncomeSubmitting(true);
    try {
      await financeService.createOtherIncome({
        description: incomeDescription.trim(),
        amount: cents / 100,
        receivedAt: new Date(`${incomeDate}T12:00:00`).toISOString(),
        ...(incomeNotes.trim() ? { notes: incomeNotes.trim() } : {}),
      });
      toast.success('Receita criada');
      setIncomeOpen(false);
      setIncomeDescription('');
      setIncomeAmount('');
      setIncomeNotes('');
      await refresh();
    } catch (error) {
      setIncomeError(errorMessage(error, 'Erro ao criar receita'));
    } finally {
      setIncomeSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <ArrowDownLeft className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">A receber</h2>
            <p className="text-sm text-muted-foreground">
              Pagamentos de clientes, avulsos e recebíveis de cartão
            </p>
          </div>
        </div>
        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              setIncomeDate(defaultDate);
              setIncomeOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Receita avulsa
          </Button>
        )}
      </div>

      <nav aria-label="Visões de a receber" className="border-b border-border">
        <ul className="flex min-w-max gap-1 overflow-x-auto">
          {TABS.map((item) => {
            const value = item.href.split('=')[1] as Tab;
            const active = tab === value;
            return (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => {
                    setTab(value);
                    setPage(1);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {!isCardTab && summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total esperado</p>
            <p className="mt-1 text-xl font-bold">
              <MoneyText value={summary.totalExpected} />
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total recebido</p>
            <p className="mt-1 text-xl font-bold">
              <MoneyText value={summary.totalReceived} colored />
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Em atraso</p>
            <p className="mt-1 text-xl font-bold">
              <MoneyText value={summary.totalOverdue} colored />
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Taxas de cartão</p>
            <p className="mt-1 text-xl font-bold">
              <MoneyText value={summary.cardFees} />
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {!isCardTab && (
          <div className="relative flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar descrição ou cliente"
              className="pl-9"
              aria-label="Buscar a receber"
            />
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => (isCardTab ? card.refresh() : refresh())}
          disabled={isLoading}
          className="sm:ml-auto"
        >
          Atualizar
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isCardTab ? (
          card.isLoading && card.items.length === 0 ? (
            <TableSkeleton rows={6} cols={6} />
          ) : card.error ? (
            <ErrorState
              message={errorMessage(card.error, 'Erro ao carregar recebíveis de cartão')}
              onRetry={() => card.refresh()}
            />
          ) : card.items.length === 0 ? (
            <EmptyState
              Icon={CreditCard}
              title="Nenhum recebível de cartão"
              description="Parcelas de vendas no crédito aparecem aqui."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Parcela</th>
                    <th className="text-right font-medium px-4 py-3">Bruto</th>
                    <th className="text-right font-medium px-4 py-3">Taxa</th>
                    <th className="text-right font-medium px-4 py-3">Líquido</th>
                    <th className="text-left font-medium px-4 py-3">Previsto</th>
                    <th className="text-center font-medium px-4 py-3">Conciliação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {card.items.map((row) => (
                    <tr key={row.id} className="text-foreground">
                      <td className="px-4 py-3">
                        {row.installmentNumber}/{row.installmentTotal}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MoneyText value={Number(row.grossAmount)} />
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        <MoneyText value={Number(row.feeAmount)} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <MoneyText value={Number(row.netAmount)} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(row.expectedDate)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.isReconciled ? (
                          <Badge variant="success">Conciliado</Badge>
                        ) : (
                          <Badge variant="warning">Pendente</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : isLoading && items.length === 0 ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar a receber')}
            onRetry={() => refresh()}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            Icon={ArrowDownLeft}
            title="Nada a receber aqui"
            description="Ajuste a visão ou cadastre uma receita avulsa."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Descrição</th>
                  <th className="text-left font-medium px-4 py-3">Cliente</th>
                  <th className="text-left font-medium px-4 py-3">Previsto</th>
                  <th className="text-center font-medium px-4 py-3">Método</th>
                  <th className="text-right font-medium px-4 py-3">Valor</th>
                  <th className="text-center font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((row: UnifiedReceivable) => (
                  <tr key={`${row.kind}-${row.id}`} className="text-foreground">
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.kind === 'OTHER_INCOME' ? 'Avulsa' : 'Pagamento'}
                        {row.isReconciled ? ' · conciliado' : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.clientName ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.expectedDate)}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {row.method ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      <MoneyText value={row.amount} colored={row.status === 'PAID'} />
                      {row.netAmount != null && row.feeAmount != null && row.feeAmount > 0 && (
                        <p className="text-xs font-normal text-muted-foreground">
                          líquido: <MoneyText value={row.netAmount} />
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={row.status} kind="receivable" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ListPagination
        page={(isCardTab ? card.pagination : pagination)?.page ?? page}
        totalPages={(isCardTab ? card.pagination : pagination)?.totalPages ?? 1}
        total={(isCardTab ? card.pagination : pagination)?.total ?? items.length}
        loading={isLoading}
        entityLabel={isCardTab ? 'recebíveis' : 'lançamentos'}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />

      <Modal
        isOpen={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        title="Nova receita avulsa"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIncomeOpen(false)}
              disabled={incomeSubmitting}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleCreateIncome}
              disabled={incomeSubmitting}
            >
              {incomeSubmitting ? 'Salvando...' : 'Criar receita'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateIncome} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-description">Descrição *</Label>
            <Input
              id="income-description"
              value={incomeDescription}
              onChange={(event) => setIncomeDescription(event.target.value)}
              placeholder="Ex.: Venda de produto avulsa"
              maxLength={200}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income-amount">Valor (R$) *</Label>
              <Input
                id="income-amount"
                value={incomeAmount}
                onChange={(event) => setIncomeAmount(event.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-date">Data do recebimento *</Label>
              <Input
                id="income-date"
                type="date"
                value={incomeDate}
                onChange={(event) => setIncomeDate(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="income-notes">Observações</Label>
            <textarea
              id="income-notes"
              value={incomeNotes}
              onChange={(event) => setIncomeNotes(event.target.value)}
              maxLength={2000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Opcional"
            />
          </div>
          {incomeError && (
            <p role="alert" className="text-sm text-destructive">
              {incomeError}
            </p>
          )}
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>
    </div>
  );
}
