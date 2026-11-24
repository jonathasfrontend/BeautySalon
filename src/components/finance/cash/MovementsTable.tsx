'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDownLeft, ArrowUpRight, Ban, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { ConfirmDialog } from '@/components/finance/common/ConfirmDialog';
import { EmptyState } from '@/components/finance/common/EmptyState';
import { financeService } from '@/services/finance.service';
import { mutateFinance } from '@/hooks/useFinance';
import { errorMessage } from '@/lib/error';
import { formatBRL, formatTime, num } from '@/lib/money';
import type { CashMovement, CashSession } from '@/types/finance';

const TYPE_LABELS: Record<string, string> = {
  SALE: 'Venda',
  SUPPLY: 'Suprimento',
  WITHDRAWAL: 'Sangria',
  EXPENSE: 'Despesa',
  REFUND: 'Estorno',
  ADJUSTMENT: 'Ajuste',
};

interface MovementsTableProps {
  session: CashSession;
  movements: CashMovement[];
  canOperate: boolean;
}

/** Tabela de movimentos da sessão com anulação em duas etapas (C4). */
export function MovementsTable({ session, movements, canOperate }: MovementsTableProps) {
  const [voiding, setVoiding] = useState<CashMovement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVoid = async (reason?: string) => {
    if (!voiding || !reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await financeService.voidMovement(session.id, voiding.id, reason);
      toast.success('Movimento anulado');
      await mutateFinance();
      setVoiding(null);
    } catch (err) {
      setError(errorMessage(err, 'Erro ao anular movimento'));
    } finally {
      setSubmitting(false);
    }
  };

  if (movements.length === 0) {
    return (
      <EmptyState
        Icon={ArrowDownLeft}
        title="Nenhum movimento nesta sessão"
        description="Registre suprimentos, vendas em dinheiro, despesas ou sangrias."
      />
    );
  }

  const isOpen = session.status === 'OPEN';

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Hora</th>
              <th className="text-left font-medium px-4 py-3">Tipo</th>
              <th className="text-left font-medium px-4 py-3">Descrição</th>
              <th className="text-right font-medium px-4 py-3">Valor</th>
              <th className="text-right font-medium px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movements.map((movement) => {
              const isIn = movement.direction === 'IN';
              const amount = num(movement.amount);
              const voided = Boolean(movement.voidedAt);
              return (
                <tr key={movement.id} className={voided ? 'opacity-50' : 'text-foreground'}>
                  <td className="px-4 py-3 text-muted-foreground">{formatTime(movement.occurredAt)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      {isIn ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                      )}
                      {TYPE_LABELS[movement.type] ?? movement.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={voided ? 'line-through' : ''}>{movement.description}</span>
                    {voided && (
                      <Badge variant="outline" className="ml-2 gap-1">
                        <Ban className="h-3 w-3" aria-hidden="true" />
                        Anulado
                      </Badge>
                    )}
                    {movement.isReconciled && !voided && (
                      <Badge variant="success" className="ml-2 gap-1">
                        <Link2 className="h-3 w-3" aria-hidden="true" />
                        Conciliado
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoneyText value={isIn ? amount : -amount} colored />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canOperate && isOpen && !voided && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setError(null);
                          setVoiding(movement);
                        }}
                        aria-label={`Anular movimento ${movement.description}`}
                      >
                        Anular
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={voiding !== null}
        title="Anular movimento"
        message={
          <>
            O movimento <strong>{voiding?.description}</strong> (
            {voiding ? formatBRL(num(voiding.amount)) : ''}) será estornado. A linha permanece
            para auditoria e o caixa é recalculado.
          </>
        }
        confirmLabel="Anular movimento"
        requireReason
        reasonLabel="Motivo do estorno"
        loading={submitting}
        error={error}
        onConfirm={handleVoid}
        onCancel={() => setVoiding(null)}
      />
    </>
  );
}

export default MovementsTable;
