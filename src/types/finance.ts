/**
 * DTOs do módulo financeiro — espelha as respostas da API /finance/* (Fase 1).
 * Campos Decimal do Prisma chegam como string no JSON: marcados com DecimalLike.
 */
import type { DecimalLike } from '@/lib/money';

export type PaymentMethod = 'CASH' | 'DEBIT' | 'CREDIT' | 'PIX' | 'LINK' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'CANCELLED';
export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'PAYMENT_ACCOUNT';
export type CategoryKind = 'INCOME' | 'EXPENSE';
export type CashSessionStatus = 'OPEN' | 'CLOSED';
export type CashMovementType =
  | 'SALE'
  | 'SUPPLY'
  | 'WITHDRAWAL'
  | 'EXPENSE'
  | 'REFUND'
  | 'ADJUSTMENT';
export type CashDirection = 'IN' | 'OUT';
export type RecurrenceInterval = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

/** Status derivado do pagável (domain/finance/payables/status). */
export type PayableStatus = 'CANCELED' | 'PAID' | 'OVERDUE' | 'DUE_TODAY' | 'PENDING';

// ---------------------------------------------------------------------------
// Cadastros
// ---------------------------------------------------------------------------

export interface FinanceSettings {
  id: string;
  companyId: string;
  requireOpenCashSession: boolean;
  cashClosingTolerance: DecimalLike;
  matchWindowDays: number;
  autoConfirmScore: number | null;
  cardTolerancePct: DecimalLike;
  fileRetentionDays: number;
  enableOverdueAlerts: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialCategory {
  id: string;
  companyId?: string;
  name: string;
  kind: CategoryKind;
  parentId: string | null;
  color: string | null;
  isSystem: boolean;
  systemCode: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankCode: string | null;
  bankName: string | null;
  agency: string | null;
  accountNumber: string | null;
  type: BankAccountType;
  ofxBankId: string | null;
  ofxAccountId: string | null;
  initialBalance: DecimalLike;
  initialBalanceDate: string;
  color: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAccountBalance {
  balance: DecimalLike;
  initialBalance: DecimalLike;
  initialBalanceDate: string;
  asOf: string;
  source: string;
  note: string;
}

export interface Acquirer {
  id: string;
  name: string;
  bankKeywords: string[];
  debitRate: DecimalLike;
  creditRate: DecimalLike;
  creditInstallmentRate: DecimalLike | null;
  installmentRates: Record<string, number> | null;
  settlementDaysDebit: number;
  settlementDaysCredit: number;
  anticipates: boolean;
  defaultBankAccountId: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Caixa (F1.2)
// ---------------------------------------------------------------------------

export interface CashRegister {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

/** Totais em CENTAVOS (computeTotals). */
export interface CashTotals {
  totalIn: number;
  totalOut: number;
  expected: number;
}

export interface CashSession {
  id: string;
  companyId?: string;
  registerId: string;
  register?: { id: string; name: string };
  status: CashSessionStatus;
  openedById: string;
  openedBy?: { id: string; name: string };
  openedAt: string;
  openingBalance: DecimalLike;
  closedById?: string | null;
  closedBy?: { id: string; name: string } | null;
  closedAt?: string | null;
  expectedCash?: DecimalLike | null;
  countedCash?: DecimalLike | null;
  difference?: DecimalLike | null;
  closingNotes?: string | null;
  summary?: CashClosingSummary | null;
  movements?: CashMovement[];
  /** Presente em GET /sessions/current e /sessions/:id (centavos). */
  totals?: CashTotals;
}

export interface CashClosingSummary {
  byType?: Record<string, number>;
  byMethod?: Record<string, number>;
  totals?: CashTotals & { counted: number; tolerance: number };
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: CashMovementType;
  direction: CashDirection;
  amount: DecimalLike;
  description: string;
  occurredAt: string;
  categoryId?: string | null;
  paymentId?: string | null;
  expenseId?: string | null;
  bankAccountId?: string | null;
  isReconciled?: boolean;
  createdById?: string;
  voidedAt?: string | null;
  voidReason?: string | null;
}

// ---------------------------------------------------------------------------
// A pagar (F1.4) — Expense + status derivado + paidAt
// ---------------------------------------------------------------------------

export interface Payable {
  id: string;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  paidAt: string | null;
  isPaid: boolean;
  isRecurring: boolean;
  notes: string | null;
  categoryId: string | null;
  supplierId: string | null;
  paidAmount: DecimalLike;
  paymentMethod: PaymentMethod | null;
  bankAccountId: string | null;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  recurrenceInterval: RecurrenceInterval | null;
  recurrenceEndsAt: string | null;
  recurrenceParentId: string | null;
  canceledAt: string | null;
  isReconciled: boolean;
  reconciledAt: string | null;
  status: PayableStatus;
  createdAt?: string;
}

// ---------------------------------------------------------------------------
// A receber (F1.5) — visão unificada
// ---------------------------------------------------------------------------

export type ReceivableKind = 'PAYMENT' | 'OTHER_INCOME';
export type ReceivableStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'REFUNDED';

export interface UnifiedReceivable {
  id: string;
  kind: ReceivableKind;
  description: string;
  clientName: string | null;
  amount: number;
  method: PaymentMethod | null;
  status: ReceivableStatus;
  expectedDate: string;
  isReconciled: boolean;
  netAmount: number | null;
  feeAmount: number | null;
  acquirerId: string | null;
}

export interface ReceivableSummary {
  totalExpected: number;
  totalReceived: number;
  totalOverdue: number;
  cardFees: number;
}

export interface CardReceivableRow {
  id: string;
  paymentId: string;
  acquirerId: string;
  installmentNumber: number;
  installmentTotal: number;
  grossAmount: DecimalLike;
  feeAmount: DecimalLike;
  netAmount: DecimalLike;
  expectedDate: string;
  isReconciled: boolean;
  reconciledAt: string | null;
}

export interface OtherIncome {
  id: string;
  description: string;
  amount: number;
  receivedAt: string;
  categoryId: string | null;
  bankAccountId: string | null;
  notes: string | null;
  source: 'MANUAL' | 'RECURRING' | 'BANK_RECONCILIATION';
  isReconciled: boolean;
  reconciledAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Visão geral (F1.6)
// ---------------------------------------------------------------------------

export interface OverviewBankBalance {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
}

export interface OverviewCashSession {
  id: string;
  registerName: string;
  openedAt: string;
  expectedCash: number | null;
}

export interface FinanceOverview {
  bankBalances: {
    accounts: OverviewBankBalance[];
    total: number;
  };
  cash: {
    status: 'OPEN' | 'CLOSED';
    sessions: OverviewCashSession[];
  };
  payables: { overdue: number; next7Days: number; thisMonth: number };
  receivables: {
    cardOverdue: number;
    cardNext7Days: number;
    cardThisMonth: number;
    pendingPayments: number;
  };
  flows: {
    from: string;
    to: string;
    inflows: number;
    outflows: number;
    net: number;
  };
  alerts: {
    overdueExpenses: number;
    cashOpenOver24h: number;
    overdueCardReceivables: number;
  };
}
