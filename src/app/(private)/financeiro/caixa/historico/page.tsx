'use client';

import { useState } from 'react';
import { History, Inbox, Wallet } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCashSessions, useCashSessionById } from '@/hooks/useFinance';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { EmptyState } from '@/components/finance/common/EmptyState';
import { ErrorState } from '@/components/finance/common/ErrorState';
import { ListPagination } from '@/components/finance/common/ListPagination';
import { TableSkeleton } from '@/components/finance/common/TableSkeleton';
import { MovementsTable } from '@/components/finance/cash/MovementsTable';
import { errorMessage } from '@/lib/error';
import { formatDateTime, num } from '@/lib/money';
import type { CashSession } from '@/types/finance';

/**
 * Histórico de sessões de caixa (spec §10.3): lista paginada + detalhe com
 * fechamento (esperado/contado/diferença), resumo por tipo/método (quando a
 * sessão tem summary gravado) e movimentos.
 */
export default function CashHistoryPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const allowed =
    permissions.includes('finance.cash.operate') ||
    permissions.includes('finance.cash.view-all');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const params = {
    page,
    limit,
    ...(status !== 'ALL' ? { status } : {}),
    sort: 'openedAt:desc',
  };
  const { items, pagination, error, isLoading, refresh } = useCashSessions(params);
  const detail = useCashSessionById(selectedId);

  const selected: CashSession | null = detail.data ?? null;

  if (!allowed) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <History className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Histórico de caixas</h2>
            <p className="text-sm text-muted-foreground">
              Sessões abertas e fechadas de todos os caixas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <label htmlFor="session-status" className="sr-only">
            Status
          </label>
          <select
            id="session-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as typeof status);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-muted px-3 text-sm text-foreground"
          >
            <option value="ALL">Todos</option>
            <option value="OPEN">Abertos</option>
            <option value="CLOSED">Fechados</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading}>
            Atualizar
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading && items.length === 0 ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar o histórico')}
            onRetry={() => refresh()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            Icon={Inbox}
            title="Nenhuma sessão encontrada"
            description="Abra um caixa para registrar a primeira sessão."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Caixa</th>
                  <th className="text-left font-medium px-4 py-3">Abertura</th>
                  <th className="text-left font-medium px-4 py-3">Fechamento</th>
                  <th className="text-right font-medium px-4 py-3">Esperado</th>
                  <th className="text-right font-medium px-4 py-3">Contado</th>
                  <th className="text-right font-medium px-4 py-3">Diferença</th>
                  <th className="text-right font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((session) => {
                  const closed = session.status === 'CLOSED';
                  const difference = num(session.difference);
                  return (
                    <tr key={session.id} className="text-foreground">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
                          {session.register?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(session.openedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {closed ? formatDateTime(session.closedAt) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MoneyText value={num(session.expectedCash)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {closed ? <MoneyText value={num(session.countedCash)} /> : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {closed ? <MoneyText value={difference} colored /> : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedId(session.id)}
                          aria-label={`Ver detalhes da sessão de ${formatDateTime(session.openedAt)}`}
                        >
                          Detalhes
                        </Button>
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
        entityLabel="sessões"
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />

      <Modal
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title="Detalhe da sessão"
        size="xl"
      >
        {detail.isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : detail.error || !selected ? (
          <ErrorState
            message={errorMessage(detail.error, 'Erro ao carregar a sessão')}
            onRetry={() => detail.refresh()}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-muted-foreground">Caixa</p>
                <p className="font-medium">{selected.register?.name ?? '—'}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-muted-foreground">Abertura</p>
                <p className="font-medium">{formatDateTime(selected.openedAt)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-muted-foreground">Fechamento</p>
                <p className="font-medium">
                  {selected.closedAt ? formatDateTime(selected.closedAt) : '—'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-muted-foreground">Responsáveis</p>
                <p className="font-medium text-xs leading-5">
                  Abriu: {selected.openedBy?.name ?? '—'}
                  <br />
                  Fechou: {selected.closedBy?.name ?? '—'}
                </p>
              </div>
            </div>

            {selected.status === 'CLOSED' && (
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Esperado</p>
                  <p className="font-semibold">
                    <MoneyText value={num(selected.expectedCash)} />
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Contado</p>
                  <p className="font-semibold">
                    <MoneyText value={num(selected.countedCash)} />
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Diferença</p>
                  <p className="font-semibold">
                    <MoneyText value={num(selected.difference)} colored />
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Justificativa</p>
                  <p className="font-medium text-xs leading-5">
                    {selected.closingNotes || '—'}
                  </p>
                </div>
              </div>
            )}

            {selected.summary && (
              <div className="rounded-lg border border-border p-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Resumo do fechamento
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {selected.summary.byType && Object.keys(selected.summary.byType).length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Por tipo
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {Object.entries(selected.summary.byType).map(([type, cents]) => (
                          <li key={type} className="flex justify-between gap-3">
                            <span className="text-muted-foreground">{type}</span>
                            <MoneyText value={cents / 100} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.summary.byMethod && Object.keys(selected.summary.byMethod).length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Por método
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {Object.entries(selected.summary.byMethod).map(([method, cents]) => (
                          <li key={method} className="flex justify-between gap-3">
                            <span className="text-muted-foreground">{method}</span>
                            <MoneyText value={cents / 100} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">
                Movimentos
              </div>
              <MovementsTable
                session={selected}
                movements={selected.movements ?? []}
                canOperate={false}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
