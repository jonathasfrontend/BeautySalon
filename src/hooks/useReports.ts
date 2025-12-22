/**
 * Reports Hooks
 * 
 * Hooks customizados para gerenciar estado e data fetching de relatórios.
 * Utiliza SWR para cache, revalidação automática e loading states.
 * 
 * @see https://swr.vercel.app/
 */

'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { useState, useCallback, useMemo } from 'react';
import reportsClient from '@/lib/api/reportsClient';
import type {
  DashboardData,
  RevenueByPeriodData,
  PaymentMethodData,
  ProfitableServicesData,
  CompleteFinancialData,
  AppointmentStatsData,
  OccupancyData,
  TopSellingProductsData,
  LowStockData,
  StockMovementData,
  ClientAnalysisData,
  InactiveClientsData,
  LoyaltyAnalysisData,
  CommissionsData,
  DateRangeFilter,
  CommissionFilters,
  InactiveClientsFilter,
  ReportPeriodPreset,
} from '@/types/reports';

// ============================================================================
// CONFIGURAÇÃO SWR PADRÃO
// ============================================================================

const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000, // 30 segundos
};

// ============================================================================
// HOOK: useReportFilters
// ============================================================================

export interface UseReportFiltersReturn {
  filters: DateRangeFilter;
  period: ReportPeriodPreset;
  setPeriod: (period: ReportPeriodPreset) => void;
  setCustomRange: (startDate: string, endDate: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  resetFilters: () => void;
}

/**
 * Hook para gerenciar filtros de relatórios (datas, períodos, etc.)
 * 
 * @example
 * ```tsx
 * const { filters, period, setPeriod } = useReportFilters();
 * 
 * <select onChange={(e) => setPeriod(e.target.value)}>
 *   <option value="week">Última Semana</option>
 *   <option value="month">Último Mês</option>
 * </select>
 * ```
 */
export function useReportFilters(initialPeriod: ReportPeriodPreset = 'month'): UseReportFiltersReturn {
  const [period, setPeriodState] = useState<ReportPeriodPreset>(initialPeriod);
  const [customRange, setCustomRangeState] = useState<DateRangeFilter>({});

  const filters = useMemo(() => {
    if (period === 'custom') {
      return customRange;
    }
    return reportsClient.getDateRangeForPeriod(period);
  }, [period, customRange]);

  const setPeriod = useCallback((newPeriod: ReportPeriodPreset) => {
    setPeriodState(newPeriod);
  }, []);

  const setCustomRange = useCallback((startDate: string, endDate: string) => {
    setCustomRangeState({ startDate, endDate });
    setPeriodState('custom');
  }, []);

  const setStartDate = useCallback((date: string) => {
    setCustomRangeState((prev) => ({ ...prev, startDate: date }));
    setPeriodState('custom');
  }, []);

  const setEndDate = useCallback((date: string) => {
    setCustomRangeState((prev) => ({ ...prev, endDate: date }));
    setPeriodState('custom');
  }, []);

  const resetFilters = useCallback(() => {
    setPeriodState('month');
    setCustomRangeState({});
  }, []);

  return {
    filters,
    period,
    setPeriod,
    setCustomRange,
    setStartDate,
    setEndDate,
    resetFilters,
  };
}

// ============================================================================
// HOOK: useDashboardMetrics
// ============================================================================

export function useDashboardMetrics(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['dashboard', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    key,
    () => reportsClient.getDashboardMetrics(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

// ============================================================================
// HOOKS: Relatórios Financeiros
// ============================================================================

export function useRevenueByPeriod(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['revenue-period', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<RevenueByPeriodData>(
    key,
    () => reportsClient.getRevenueByPeriod(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function usePaymentMethods(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['payment-methods', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaymentMethodData>(
    key,
    () => reportsClient.getRevenueByPaymentMethod(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useProfitableServices(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['profitable-services', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProfitableServicesData>(
    key,
    () => reportsClient.getProfitableServices(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useCompleteFinancialReport(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['financial-complete', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<CompleteFinancialData>(
    key,
    () => reportsClient.getCompleteFinancialReport(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

// ============================================================================
// HOOKS: Relatórios de Agendamentos
// ============================================================================

export function useAppointmentStats(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['appointment-stats', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<AppointmentStatsData>(
    key,
    () => reportsClient.getAppointmentStats(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useOccupancyRate(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['occupancy-rate', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<OccupancyData>(
    key,
    () => reportsClient.getOccupancyRate(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

// ============================================================================
// HOOKS: Relatórios de Produtos
// ============================================================================

export function useTopSellingProducts(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['top-selling-products', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<TopSellingProductsData>(
    key,
    () => reportsClient.getTopSellingProducts(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useLowStockProducts(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<LowStockData>(
    'low-stock-products',
    () => reportsClient.getLowStockProducts(),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useStockMovement(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['stock-movement', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<StockMovementData>(
    key,
    () => reportsClient.getStockMovement(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

// ============================================================================
// HOOKS: Relatórios de Clientes
// ============================================================================

export function useClientAnalysis(filters: DateRangeFilter, config?: SWRConfiguration) {
  const key = filters.startDate && filters.endDate 
    ? ['client-analysis', filters.startDate, filters.endDate] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<ClientAnalysisData>(
    key,
    () => reportsClient.getClientAnalysis(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useInactiveClients(filters?: InactiveClientsFilter, config?: SWRConfiguration) {
  const key = ['inactive-clients', filters?.daysInactive || 60];

  const { data, error, isLoading, mutate } = useSWR<InactiveClientsData>(
    key,
    () => reportsClient.getInactiveClients(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useLoyaltyAnalysis(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<LoyaltyAnalysisData>(
    'loyalty-analysis',
    () => reportsClient.getLoyaltyAnalysis(),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

// ============================================================================
// HOOKS: Relatórios de Comissões
// ============================================================================

export function useCommissionsReport(filters?: CommissionFilters, config?: SWRConfiguration) {
  const key = ['commissions', filters?.staffId, filters?.startDate, filters?.endDate];

  const { data, error, isLoading, mutate } = useSWR<CommissionsData>(
    key,
    () => reportsClient.getCommissionsReport(filters),
    { ...defaultSWRConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}
