'use client';

import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { financeService } from '@/services/finance.service';
import { mutateFinance } from '@/hooks/useFinance';
import { errorMessage } from '@/lib/error';
import { formatBRL, parseMoneyInput, toDateInput } from '@/lib/money';
import type { BankAccount, Payable, PaymentMethod } from '@/types/finance';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
  PIX: 'Pix',
  LINK: 'Link de pagamento',
  WALLET: 'Carteira digital',
};

interface PayModalProps {
  open: boolean;
  payable: Payable | null;
  bankAccounts: BankAccount[];
  onClose: () => void;
  onPaid?: () => void;
}

/**
 * Baixa de conta a pagar (spec §10.3): data, valor pago (aceita parcial),
 * método e conta bancária (obrigatória quando exigida pelo backend → 422
 * BANK_ACCOUNT_REQUIRED exibido como mensagem).
 */
export function PayModal({ open, payable, bankAccounts, onClose, onPaid }: PayModalProps) {
  const [paidAt, setPaidAt] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [bankAccountId, setBankAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const activeAccounts = bankAccounts.filter((account) => account.isActive);

  useEffect(() => {
    if (!open || !payable) return;
    setPaidAt(toDateInput(new Date().toISOString()));
    setPaidAmount(String(payable.amount).replace('.', ','));
    setPaymentMethod('PIX');
    setBankAccountId(activeAccounts[0]?.id ?? '');
    setServerError(null);
    // activeAccounts é derivado; depender dele causaria loop de reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payable]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!payable) return;
    setServerError(null);

    const cents = parseMoneyInput(paidAmount);
    if (cents <= 0) {
      toast.error('Informe um valor maior que zero');
      return;
    }
    if (!paidAt) {
      toast.error('Informe a data do pagamento');
      return;
    }

    setSubmitting(true);
    try {
      await financeService.payPayable(payable.id, {
        paidAt: new Date(`${paidAt}T12:00:00`).toISOString(),
        paidAmount: cents / 100,
        paymentMethod,
        ...(bankAccountId ? { bankAccountId } : {}),
      });
      toast.success('Conta marcada como paga');
      await mutateFinance();
      onClose();
      onPaid?.();
    } catch (error) {
      setServerError(errorMessage(error, 'Erro ao registrar pagamento'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!payable) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Registrar pagamento"
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Registrando...' : 'Confirmar pagamento'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-medium text-foreground">{payable.description}</p>
          <p className="mt-1 text-muted-foreground">
            Vencimento {payable.dueDate.slice(0, 10).split('-').reverse().join('/')} · Valor{' '}
            <MoneyText value={payable.amount} />
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pay-date">Data do pagamento *</Label>
            <Input
              id="pay-date"
              type="date"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-amount">Valor pago (R$) *</Label>
            <Input
              id="pay-amount"
              value={paidAmount}
              onChange={(event) => setPaidAmount(event.target.value)}
              inputMode="decimal"
              required
            />
            <p className="text-xs text-muted-foreground">
              Diferente de {formatBRL(payable.amount)} gera pagamento parcial.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-method">Método *</Label>
            <select
              id="pay-method"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
            >
              {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((method) => (
                <option key={method} value={method}>
                  {METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-account">Conta bancária</Label>
            <select
              id="pay-account"
              value={bankAccountId}
              onChange={(event) => setBankAccountId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
            >
              <option value="">Selecionar...</option>
              {activeAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

export default PayModal;
