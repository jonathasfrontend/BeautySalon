/**
 * Fronteira de dinheiro no cliente — spec §10.5.
 * O servidor é a fonte de verdade; aqui só formatação e soma para exibição.
 */

/** Reais → centavos inteiros (arredondamento half-up do JS Math.round). */
export const toCents = (value: number): number => Math.round(value * 100);

/** Centavos → reais. */
export const fromCents = (cents: number): number => cents / 100;

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata reais como BRL (R$ 1.234,56). */
export const formatBRL = (value: number): string => brlFormatter.format(value);

/**
 * Aceita entrada do usuário no padrão BR ("1.234,56", "1234,56", "1234")
 * e devolve centavos inteiros. Inválido → 0.
 */
export const parseMoneyInput = (raw: string): number => {
  const normalized = raw.replace(/\s/g, '').replace(/R\$/g, '');
  if (!normalized) return 0;
  const hasComma = normalized.includes(',');
  const cleaned = hasComma
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? toCents(value) : 0;
};

/** centavos → string de input ("1234,56"). */
export const centsToInputValue = (cents: number): string =>
  (cents / 100).toFixed(2).replace('.', ',');

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Data sem fuso (YYYY-MM-DD ou ISO terminando em T00:00:00.000Z) → dd/MM/yyyy
 * SEM converter de fuso (regra §10.2: nunca `new Date('2026-11-18')`).
 * Datetime completo → dd/MM/yyyy no fuso local.
 */
export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  if (typeof value === 'string') {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    const utcMidnight = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(\.000)?Z$/.exec(value);
    if (utcMidnight) return `${utcMidnight[3]}/${utcMidnight[2]}/${utcMidnight[1]}`;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return formatDateTime(parsed);
    return '—';
  }
  return formatDateTime(value);
}

/** Datetime → dd/MM/yyyy HH:mm no fuso local. */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} ${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`;
}

/** Hora do datetime local (HH:mm) — abertura de caixa, etc. */
export function formatTime(value?: string | Date | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Decimal do Prisma serializa como string no JSON. */
export type DecimalLike = number | string | null | undefined;

/** Coerce Decimal-string/number do backend para number. */
export const num = (value: DecimalLike): number => {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
};

/** dd/MM/yyyy → YYYY-MM-DD (input de data sem fuso). */
export const toDateInput = (value?: string | Date | null): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
