'use client';

import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { financeService } from '@/services/finance.service';
import { mutateFinance } from '@/hooks/useFinance';
import { errorMessage } from '@/lib/error';
import { parseMoneyInput } from '@/lib/money';
import type { FinancialCategory, Payable, RecurrenceInterval, Supplier } from '@/types/finance';

interface PayableFormModalProps {
  open: boolean;
  /** Presente = edição; ausente = criação. */
  payable?: Payable | null;
  categories: FinancialCategory[];
  suppliers: Supplier[];
  onClose: () => void;
  onSaved?: (created: Payable[]) => void;
}

const RECURRENCE_LABELS: Record<RecurrenceInterval, string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

/**
 * Modal de conta a pagar (spec §10.3): criação com parcelamento (2–360)
 * OU recorrência (fim opcional) — os dois nunca juntos. Edição limitada
 * aos campos permitidos pelo backend (sem tocar em status/pagamento).
 */
export function PayableFormModal({
  open,
  payable,
  categories,
  suppliers,
  onClose,
  onSaved,
}: PayableFormModalProps) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [installments, setInstallments] = useState('1');
  const [recurrence, setRecurrence] = useState<'' | RecurrenceInterval>('');
  const [recurrenceEndsAt, setRecurrenceEndsAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = Boolean(payable);

  useEffect(() => {
    if (!open) return;
    setServerError(null);
    if (payable) {
      setDescription(payable.description);
      setCategory(payable.category);
      setCategoryId(payable.categoryId ?? '');
      setSupplierId(payable.supplierId ?? '');
      setAmount(String(payable.amount).replace('.', ','));
      setDueDate(payable.dueDate.slice(0, 10));
      setNotes(payable.notes ?? '');
      setInstallments('1');
      setRecurrence('');
      setRecurrenceEndsAt('');
    } else {
      setDescription('');
      setCategory('');
      setCategoryId('');
      setSupplierId('');
      setAmount('');
      setDueDate('');
      setNotes('');
      setInstallments('1');
      setRecurrence('');
      setRecurrenceEndsAt('');
    }
  }, [open, payable]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);

    const cents = parseMoneyInput(amount);
    if (cents <= 0) {
      toast.error('Informe um valor maior que zero');
      return;
    }
    if (!dueDate) {
      toast.error('Informe o vencimento');
      return;
    }
    const hasInstallments = !isEdit && Number(installments) > 1;
    const hasRecurrence = !isEdit && recurrence !== '';
    if (hasInstallments && hasRecurrence) {
      setServerError('Parcelamento e recorrência não podem ser usados juntos');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && payable) {
        await financeService.updatePayable(payable.id, {
          description: description.trim(),
          category: category.trim(),
          amount: cents / 100,
          dueDate,
          notes: notes.trim() || null,
          categoryId: categoryId || null,
          supplierId: supplierId || null,
        });
        toast.success('Conta atualizada');
        await mutateFinance();
        onClose();
        return;
      }

      const created = await financeService.createPayable({
        description: description.trim(),
        category: category.trim(),
        amount: cents / 100,
        dueDate,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(hasInstallments ? { installments: Number(installments) } : {}),
        ...(hasRecurrence
          ? {
              recurrenceInterval: recurrence,
              ...(recurrenceEndsAt ? { recurrenceEndsAt } : {}),
            }
          : {}),
      });
      toast.success(
        created.length > 1
          ? `${created.length} parcelas criadas`
          : 'Conta criada'
      );
      await mutateFinance();
      onClose();
      onSaved?.(created);
    } catch (error) {
      const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (code) {
        setServerError(errorMessage(error, 'Não foi possível salvar'));
      } else {
        setServerError(errorMessage(error, 'Erro ao salvar conta'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const expenseCategories = categories.filter((item) => item.kind === 'EXPENSE');
  const activeSuppliers = suppliers.filter((item) => item.isActive);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isEdit ? 'Editar conta a pagar' : 'Nova conta a pagar'}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar conta'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="payable-description">Descrição *</Label>
            <Input
              id="payable-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: Aluguel, Produtos de limpeza"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payable-category">Categoria (texto) *</Label>
            <Input
              id="payable-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Ex.: Aluguel"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payable-category-id">Categoria financeira</Label>
            <select
              id="payable-category-id"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
            >
              <option value="">Sem vínculo</option>
              {expenseCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payable-amount">Valor total (R$) *</Label>
            <Input
              id="payable-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payable-due-date">1º vencimento *</Label>
            <Input
              id="payable-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payable-supplier">Fornecedor</Label>
            <select
              id="payable-supplier"
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
            >
              <option value="">Sem fornecedor</option>
              {activeSuppliers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="payable-installments">Parcelas</Label>
                <Input
                  id="payable-installments"
                  type="number"
                  min={1}
                  max={360}
                  value={installments}
                  onChange={(event) => setInstallments(event.target.value)}
                  disabled={recurrence !== ''}
                />
                <p className="text-xs text-muted-foreground">
                  2 a 360 cria uma parcela por vencimento mensal.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payable-recurrence">Recorrência</Label>
                <select
                  id="payable-recurrence"
                  value={recurrence}
                  onChange={(event) =>
                    setRecurrence(event.target.value as '' | RecurrenceInterval)
                  }
                  disabled={Number(installments) > 1}
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Não recorrente</option>
                  {(Object.keys(RECURRENCE_LABELS) as RecurrenceInterval[]).map((interval) => (
                    <option key={interval} value={interval}>
                      {RECURRENCE_LABELS[interval]}
                    </option>
                  ))}
                </select>
              </div>

              {recurrence !== '' && (
                <div className="space-y-2">
                  <Label htmlFor="payable-recurrence-end">Termina em (opcional)</Label>
                  <Input
                    id="payable-recurrence-end"
                    type="date"
                    value={recurrenceEndsAt}
                    onChange={(event) => setRecurrenceEndsAt(event.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="payable-notes">Observações</Label>
            <textarea
              id="payable-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Opcional"
            />
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

export default PayableFormModal;
