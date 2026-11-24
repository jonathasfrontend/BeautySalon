'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { financeService } from '@/services/finance.service';
import { mutateFinance } from '@/hooks/useFinance';
import { errorMessage } from '@/lib/error';
import { centsToInputValue, formatBRL, num, parseMoneyInput, toCents } from '@/lib/money';
import type { CashSession, FinanceSettings } from '@/types/finance';

interface CloseCashModalProps {
  open: boolean;
  session: CashSession;
  settings?: FinanceSettings;
  onClose: () => void;
  onClosed?: () => void;
}

/**
 * Modal "Fechar caixa" (spec §10.3): diferença recalculada ao digitar em
 * centavos; o SERVIDOR recalcula e é a fonte de verdade. Justificativa só
 * obrigatória acima da tolerância (erro CLOSING_NOTES_REQUIRED tratado aqui).
 */
export function CloseCashModal({ open, session, settings, onClose, onClosed }: CloseCashModalProps) {
  const [counted, setCounted] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const expectedCents = useMemo(() => {
    if (session.totals) return session.totals.expected;
    return toCents(num(session.expectedCash));
  }, [session]);

  const toleranceCents = toCents(num(settings?.cashClosingTolerance ?? 0));
  const countedCents = parseMoneyInput(counted);
  const differenceCents = countedCents - expectedCents;
  const needsNotes = Math.abs(differenceCents) > toleranceCents && counted !== '';

  useEffect(() => {
    if (open) {
      setCounted(centsToInputValue(expectedCents));
      setNotes('');
      setServerError(null);
    }
  }, [open, expectedCents]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (countedCents < 0) {
      toast.error('Valor contado não pode ser negativo');
      return;
    }
    if (needsNotes && !notes.trim()) {
      setServerError('Informe a justificativa da diferença');
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      await financeService.closeSession(session.id, {
        countedCash: countedCents / 100,
        ...(notes.trim() ? { closingNotes: notes.trim() } : {}),
      });
      toast.success('Caixa fechado com sucesso');
      await mutateFinance();
      onClose();
      onClosed?.();
    } catch (error) {
      const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (code === 'CLOSING_NOTES_REQUIRED') {
        setServerError('Diferença acima da tolerância: justificativa é obrigatória');
      } else {
        setServerError(errorMessage(error, 'Erro ao fechar o caixa'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const differenceLabel =
    differenceCents === 0
      ? 'Sem diferença'
      : differenceCents > 0
        ? `${formatBRL(differenceCents / 100)} (sobra)`
        : `${formatBRL(Math.abs(differenceCents) / 100)} (falta)`;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Fechar caixa"
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Fechando...' : 'Fechar caixa'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Esperado em caixa</span>
            <span className="font-semibold">
              <MoneyText value={expectedCents / 100} />
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="counted-cash">Dinheiro contado (R$)</Label>
          <Input
            id="counted-cash"
            value={counted}
            onChange={(event) => setCounted(event.target.value)}
            inputMode="decimal"
            autoFocus
            required
          />
        </div>

        <div
          className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
            differenceCents === 0
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : Math.abs(differenceCents) > toleranceCents
                ? 'border-rose-500/40 bg-rose-500/10'
                : 'border-amber-500/40 bg-amber-500/10'
          }`}
          aria-live="polite"
        >
          <span className="text-muted-foreground">Diferença</span>
          <span className="font-semibold">{differenceLabel}</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="closing-notes">
            Justificativa {needsNotes ? '*' : '(opcional)'}
          </Label>
          <Input
            id="closing-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={needsNotes ? 'Obrigatória: diferença acima da tolerância' : 'Opcional'}
            maxLength={500}
          />
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          O servidor recalcula esperado e diferença — os valores acima são apenas conferência
          prévia. Compare com extrato e maquininha antes de confirmar.
        </p>

        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

export default CloseCashModal;
