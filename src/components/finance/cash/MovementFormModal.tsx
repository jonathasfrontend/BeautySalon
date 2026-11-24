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
import type { CashMovementType } from '@/types/finance';

const TYPE_OPTIONS: {
  value: CashMovementType;
  label: string;
  direction: 'IN' | 'OUT';
}[] = [
  { value: 'SUPPLY', label: 'Suprimento (entrada de troco)', direction: 'IN' },
  { value: 'WITHDRAWAL', label: 'Sangria (retirada p/ depósito)', direction: 'OUT' },
  { value: 'EXPENSE', label: 'Despesa de caixa', direction: 'OUT' },
  { value: 'SALE', label: 'Venda em dinheiro', direction: 'IN' },
  { value: 'REFUND', label: 'Estorno', direction: 'OUT' },
  { value: 'ADJUSTMENT', label: 'Ajuste', direction: 'IN' },
];

interface MovementFormModalProps {
  open: boolean;
  sessionId: string;
  defaultType?: CashMovementType;
  onClose: () => void;
  onDone?: () => void;
}

/** Novo movimento de caixa (C2): valor > 0, descrição obrigatória (exceto SALE). */
export function MovementFormModal({
  open,
  sessionId,
  defaultType = 'SUPPLY',
  onClose,
  onDone,
}: MovementFormModalProps) {
  const [type, setType] = useState<CashMovementType>(defaultType);
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const option = TYPE_OPTIONS.find((item) => item.value === defaultType);
      setType(defaultType);
      setDirection(option?.direction ?? 'IN');
      setAmount('');
      setDescription('');
    }
  }, [open, defaultType]);

  const handleTypeChange = (value: CashMovementType) => {
    setType(value);
    const option = TYPE_OPTIONS.find((item) => item.value === value);
    if (option) setDirection(option.direction);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cents = parseMoneyInput(amount);
    if (cents <= 0) {
      toast.error('Informe um valor maior que zero');
      return;
    }
    if (type !== 'SALE' && !description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    setSubmitting(true);
    try {
      await financeService.addMovement(sessionId, {
        type,
        direction,
        amount: cents / 100,
        description: description.trim() || undefined,
      });
      toast.success('Movimento registrado');
      await mutateFinance();
      onClose();
      onDone?.();
    } catch (error) {
      toast.error(errorMessage(error, 'Erro ao registrar movimento'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Novo movimento de caixa"
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Salvando...' : 'Registrar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="movement-type">Tipo</Label>
          <select
            id="movement-type"
            value={type}
            onChange={(event) => handleTypeChange(event.target.value as CashMovementType)}
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="movement-direction">Direção</Label>
          <select
            id="movement-direction"
            value={direction}
            onChange={(event) => setDirection(event.target.value as 'IN' | 'OUT')}
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
          >
            <option value="IN">Entrada (+)</option>
            <option value="OUT">Saída (−)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="movement-amount">Valor (R$)</Label>
          <Input
            id="movement-amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="movement-description">
            Descrição {type !== 'SALE' ? '*' : '(opcional)'}
          </Label>
          <Input
            id="movement-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={type === 'SALE' ? 'Cliente · serviço' : 'Ex.: Depósito Itaú'}
            maxLength={200}
          />
        </div>

        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

export default MovementFormModal;
