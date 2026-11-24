'use client';

import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/money';

interface MoneyTextProps {
  value: number;
  /** Pinta emerald/rose conforme o sinal (espec §10.2: entrada/saída). */
  colored?: boolean;
  /** Força o sinal +/− no texto (totais de fluxo). */
  signed?: boolean;
  className?: string;
}

/**
 * Valor em BRL, `tabular-nums`, alinhado à direita (spec §10.2).
 */
export function MoneyText({ value, colored = false, signed = false, className }: MoneyTextProps) {
  const text = formatBRL(value);
  const sign = signed && value > 0 ? '+' : value < 0 ? '−' : '';
  const display = signed || value < 0 ? `${sign} ${text.replace('-', '')}` : text;

  return (
    <span
      className={cn(
        'tabular-nums whitespace-nowrap',
        colored && value > 0 && 'text-emerald-600 dark:text-emerald-400',
        colored && value < 0 && 'text-rose-600 dark:text-rose-400',
        className
      )}
    >
      {display}
    </span>
  );
}

export default MoneyText;
