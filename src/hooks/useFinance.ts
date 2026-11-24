'use client';

/**
 * Hooks SWR do módulo financeiro (F1.8) — spec §10.5.
 * Chaves sempre sob o prefixo 'finance/' para invalidação em bloco:
 *   mutate((k) => Array.isArray(k) && String(k[0]).startsWith('finance/'))
 */
import useSWR, { mutate, SWRConfiguration } from 'swr';
import { financeService } from '@/services/finance.service';
import type {
  Acquirer,
  BankAccount,
  CardReceivableRow,
  CashRegister,
  CashSession,
  FinanceOverview,
  FinanceSettings,
  FinancialCategory,
  OtherIncome,
  Payable,
  Supplier,
  UnifiedReceivable,
} from '@/types/finance';

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 10000,
};

type ListParams = Record<string, string | number | boolean | undefined>;

/** Revalida tudo do módulo financeiro após uma mutação. */
export function mutateFinance() {
  return mutate((key) => Array.isArray(key) && String(key[0]).startsWith('finance/'));
}

export function useFinanceOverview(params?: { from?: string; to?: string }) {
  const key: [string, string?, string?] = ['finance/overview', params?.from, params?.to];
  const { data, error, isLoading, mutate } = useSWR<FinanceOverview>(
    key,
    () => financeService.getOverview(params),
    defaultConfig
  );
  return { data, error, isLoading, refresh: mutate };
}

export function useFinanceSettings() {
  const { data, error, isLoading, mutate } = useSWR<FinanceSettings>(
    'finance/settings',
    () => financeService.getSettings(),
    defaultConfig
  );
  return { data, error, isLoading, refresh: mutate };
}

export function useCashRegisters() {
  const { data, error, isLoading, mutate } = useSWR(
    'finance/cash/registers',
    () => financeService.listRegisters({ limit: 100, sort: 'name:asc' }),
    defaultConfig
  );
  return {
    items: data?.items ?? [],
    pagination: data?.pagination,
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Sessão aberta de um caixa. `registerId` vazio → desligado.
 * 404 = nenhum caixa aberto: o chamador trata `error` (não é falha de rede).
 */
export function useCurrentCashSession(registerId?: string | null) {
  const { data, error, isLoading, mutate } = useSWR<CashSession>(
    registerId ? ['finance/cash/current', registerId] : null,
    () => financeService.currentSession(registerId!),
    { ...defaultConfig, shouldRetryOnError: false, dedupingInterval: 3000 }
  );
  return { data, error, isLoading, refresh: mutate };
}

export function useCashSessions(params?: ListParams) {
  const key: [string, string] = ['finance/cash/sessions', JSON.stringify(params ?? {})];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => financeService.listSessions(params),
    defaultConfig
  );
  return {
    items: data?.items ?? [],
    pagination: data?.pagination,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useCashSessionById(id?: string | null) {
  const { data, error, isLoading, mutate } = useSWR<CashSession>(
    id ? ['finance/cash/session', id] : null,
    () => financeService.getSession(id!),
    { ...defaultConfig, shouldRetryOnError: false }
  );
  return { data, error, isLoading, refresh: mutate };
}

export function usePayables(params?: ListParams) {
  const key: [string, string] = ['finance/payables', JSON.stringify(params ?? {})];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => financeService.listPayables(params),
    defaultConfig
  );
  return {
    items: data?.items ?? [],
    pagination: data?.pagination,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useReceivables(params?: ListParams) {
  const key: [string, string] = ['finance/receivables', JSON.stringify(params ?? {})];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => financeService.listReceivables(params),
    defaultConfig
  );
  return {
    items: data?.items ?? [],
    pagination: data?.pagination,
    summary: data?.summary,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useCardReceivables(params?: ListParams) {
  const key: [string, string] = ['finance/card-receivables', JSON.stringify(params ?? {})];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => financeService.listCardReceivables(params),
    defaultConfig
  );
  return {
    items: (data?.items ?? []) as CardReceivableRow[],
    pagination: data?.pagination,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    'finance/categories',
    () => financeService.listCategories({ limit: 200, sort: 'sortOrder:asc' }),
    defaultConfig
  );
  return {
    items: (data?.items ?? []) as FinancialCategory[],
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useSuppliers() {
  const { data, error, isLoading, mutate } = useSWR(
    'finance/suppliers',
    () => financeService.listSuppliers({ limit: 200, sort: 'name:asc' }),
    defaultConfig
  );
  return { items: (data?.items ?? []) as Supplier[], error, isLoading, refresh: mutate };
}

export function useBankAccounts() {
  const { data, error, isLoading, mutate } = useSWR(
    'finance/bank-accounts',
    () => financeService.listBankAccounts({ limit: 100, sort: 'name:asc' }),
    defaultConfig
  );
  return { items: (data?.items ?? []) as BankAccount[], error, isLoading, refresh: mutate };
}

export function useAcquirers() {
  const { data, error, isLoading, mutate } = useSWR(
    'finance/acquirers',
    () => financeService.listAcquirers({ limit: 100, sort: 'name:asc' }),
    defaultConfig
  );
  return { items: (data?.items ?? []) as Acquirer[], error, isLoading, refresh: mutate };
}

export function useOtherIncomes(params?: ListParams) {
  const key: [string, string] = ['finance/other-incomes', JSON.stringify(params ?? {})];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => financeService.listOtherIncomes(params),
    defaultConfig
  );
  return {
    items: (data?.items ?? []) as OtherIncome[],
    pagination: data?.pagination,
    error,
    isLoading,
    refresh: mutate,
  };
}

export type { Payable };
