'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowUpRight, Ban, Pencil, Plus, Search, Wallet } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useBankAccounts, useCategories, usePayables, useSuppliers } from '@/hooks/useFinance';
import { financeService } from '@/services/finance.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/finance/common/StatusBadge';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { EmptyState } from '@/components/finance/common/EmptyState';
import { ErrorState } from '@/components/finance/common/ErrorState';
import { ListPagination } from '@/components/finance/common/ListPagination';
import { TableSkeleton } from '@/components/finance/common/TableSkeleton';
import { ConfirmDialog } from '@/components/finance/common/ConfirmDialog';
import { PayableFormModal } from '@/components/finance/payables/PayableFormModal';
import { PayModal } from '@/components/finance/payables/PayModal';
import { errorMessage } from '@/lib/error';
import { formatBRL, formatDate } from '@/lib/money';
import type { Payable, PayableStatus } from '@/types/finance';

type StatusFilter = 'ALL' | PayableStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'OVERDUE', label: 'Vencidas' },
  { value: 'DUE_TODAY', label: 'Vencem hoje' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'PAID', label: 'Pagas' },
  { value: 'CANCELED', label: 'Canceladas' },
];

export default function APagarPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canList = permissions.includes('finance.payables.list');
  const canManage = permissions.includes('finance.catalog.manage');
  const canPay = permissions.includes('finance.payables.pay');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');

  const { items, pagination, error, isLoading, refresh } = usePayables({
    page,
    limit,
    ...(status !== 'ALL' ? { status } : {}),
    sort: 'dueDate:asc',
  });
  const { items: categories } = useCategories();
  const { items: suppliers } = useSuppliers();
  const { items: bankAccounts } = useBankAccounts();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Payable | null>(null);
  const [paying, setPaying] = useState<Payable | null>(null);
  const [canceling, setCanceling] = useState<Payable | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
  }, [items, search]);

  useEffect(() => {
    if (!canList) router.push('/dashboard');
  }, [canList, router]);

  if (!canList) return null;

  const handleCancel = async (id?: string) => {
    if (!canceling && !id) return;
    const targetId = id ?? canceling?.id;
    if (!targetId) return;
    setCancelingId(targetId);
    setCancelError(null);
    try {
      await financeService.cancelPayable(targetId);
      toast.success('Conta cancelada');
      await refresh();
      setCanceling(null);
    } catch (err) {
      setCancelError(errorMessage(err, 'Erro ao cancelar conta'));
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <ArrowUpRight className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Contas a pagar</h2>
            <p className="text-sm text-muted-foreground">
              Vencimentos, parcelamentos e baixas
            </p>
          </div>
        </div>
        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova conta
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar descrição ou categoria"
            className="pl-9"
            aria-label="Buscar contas a pagar"
          />
        </div>
        <label htmlFor="payable-status" className="sr-only">
          Status
        </label>
        <select
          id="payable-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as StatusFilter);
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-muted px-3 text-sm text-foreground"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading}>
          Atualizar
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading && items.length === 0 ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar contas a pagar')}
            onRetry={() => refresh()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            Icon={Wallet}
            title={search ? 'Nenhuma conta encontrada' : 'Nenhuma conta a pagar'}
            description={
              canManage
                ? 'Cadastre a primeira conta para acompanhar vencimentos.'
                : 'Nada por aqui no momento.'
            }
            action={
              canManage && !search ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Nova conta
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Descrição</th>
                  <th className="text-left font-medium px-4 py-3">Categoria</th>
                  <th className="text-left font-medium px-4 py-3">Vencimento</th>
                  <th className="text-right font-medium px-4 py-3">Valor</th>
                  <th className="text-center font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((payable) => {
                  const canCancel =
                    canManage &&
                    payable.status !== 'CANCELED' &&
                    payable.status !== 'PAID';
                  const canPayNow = canPay && payable.status !== 'PAID' && payable.status !== 'CANCELED';
                  return (
                    <tr key={payable.id} className="text-foreground">
                      <td className="px-4 py-3">
                        <p className="font-medium">{payable.description}</p>
                        {payable.installmentTotal && payable.installmentNumber && (
                          <p className="text-xs text-muted-foreground">
                            Parcela {payable.installmentNumber}/{payable.installmentTotal}
                          </p>
                        )}
                        {payable.isRecurring && !payable.recurrenceParentId && (
                          <p className="text-xs text-muted-foreground">Recorrente</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{payable.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            payable.status === 'OVERDUE' ? 'font-medium text-rose-600 dark:text-rose-400' : ''
                          }
                        >
                          {formatDate(payable.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <MoneyText value={payable.amount} />
                        {payable.isPaid && payable.paidAmount != null && (
                          <p className="text-xs font-normal text-muted-foreground">
                            pago: {formatBRL(Number(payable.paidAmount))}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={payable.status} kind="payable" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {canPayNow && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPaying(payable)}
                              aria-label={`Pagar ${payable.description}`}
                            >
                              Pagar
                            </Button>
                          )}
                          {canManage && payable.status !== 'PAID' && payable.status !== 'CANCELED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditing(payable);
                                setFormOpen(true);
                              }}
                              aria-label={`Editar ${payable.description}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canCancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCancelError(null);
                                setCanceling(payable);
                              }}
                              aria-label={`Cancelar ${payable.description}`}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ListPagination
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages ?? 1}
        total={pagination?.total ?? items.length}
        loading={isLoading}
        entityLabel="contas"
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />

      <PayableFormModal
        open={formOpen}
        payable={editing}
        categories={categories}
        suppliers={suppliers}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => refresh()}
      />

      <PayModal
        open={paying !== null}
        payable={paying}
        bankAccounts={bankAccounts}
        onClose={() => setPaying(null)}
        onPaid={() => refresh()}
      />

      <ConfirmDialog
        open={canceling !== null}
        title="Cancelar conta"
        message={
          <>
            A conta <strong>{canceling?.description}</strong> (
            {canceling ? formatBRL(canceling.amount) : ''}) será cancelada. O histórico é
            preservado e ela sai dos vencimentos.
          </>
        }
        confirmLabel="Cancelar conta"
        loading={cancelingId !== null}
        error={cancelError}
        onConfirm={() => handleCancel()}
        onCancel={() => setCanceling(null)}
      />
    </div>
  );
}
