/**
 * Reports API Client
 * 
 * Cliente para consumir todas as rotas de relatórios do backend.
 * Utiliza o client axios configurado com interceptors de autenticação.
 * 
 * Base URL: process.env.NEXT_PUBLIC_API_URL/reports
 * 
 * @see ROUTES.md - Seção 📊 10. Relatórios
 * @see postman_collection.json - Reports folder
 */

import api from '@/lib/api';
import type {
  ApiResponse,
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
} from '@/types/reports';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Constrói query string a partir de objeto de filtros
 */
function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Formata data para o formato esperado pela API (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Obtém range de datas para períodos pré-definidos
 */
export function getDateRangeForPeriod(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): DateRangeFilter {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'today':
      // start já é hoje
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return {
    startDate: formatDateForApi(start),
    endDate: formatDateForApi(end),
  };
}

// ============================================================================
// DASHBOARD GERAL
// ============================================================================

/**
 * GET /reports/dashboard
 * 
 * Busca métricas gerais do dashboard para o período especificado.
 * 
 * @param filters - Filtros de data (startDate, endDate)
 * @returns Dashboard com métricas principais
 * 
 * @example
 * ```typescript
 * const data = await getDashboardMetrics({
 *   startDate: '2025-12-01',
 *   endDate: '2025-12-31'
 * });
 * ```
 */
export async function getDashboardMetrics(
  filters: DateRangeFilter
): Promise<DashboardData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<DashboardData>>(
    `/reports/dashboard${queryString}`
  );
  return response.data.data;
}

// ============================================================================
// RELATÓRIOS FINANCEIROS
// ============================================================================

/**
 * GET /reports/financial/revenue
 * 
 * Busca análise detalhada de receita com comparação de período anterior.
 * Inclui dados diários e detalhes de despesas.
 * 
 * @param filters - Filtros de data
 * @returns Receita detalhada com comparação
 * 
 * @example
 * ```typescript
 * const revenue = await getRevenueByPeriod({
 *   startDate: '2025-12-01',
 *   endDate: '2025-12-31'
 * });
 * console.log(revenue.comparison.revenueGrowth); // 13.64
 * ```
 */
export async function getRevenueByPeriod(
  filters: DateRangeFilter
): Promise<RevenueByPeriodData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<RevenueByPeriodData>>(
    `/reports/financial/revenue${queryString}`
  );
  return response.data.data;
}

/**
 * GET /reports/financial/payment-methods
 * 
 * Busca distribuição de receita por método de pagamento.
 * 
 * @param filters - Filtros de data
 * @returns Distribuição por método de pagamento
 */
export async function getRevenueByPaymentMethod(
  filters: DateRangeFilter
): Promise<PaymentMethodData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<PaymentMethodData>>(
    `/reports/financial/payment-methods${queryString}`
  );
  return response.data.data;
}

/**
 * GET /reports/financial/services
 * 
 * Busca ranking de serviços mais lucrativos.
 * 
 * @param filters - Filtros de data
 * @returns Serviços ordenados por receita
 */
export async function getProfitableServices(
  filters: DateRangeFilter
): Promise<ProfitableServicesData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<ProfitableServicesData>>(
    `/reports/financial/services${queryString}`
  );
  return response.data.data;
}

/**
 * GET /reports/financial/complete
 * 
 * Busca relatório financeiro consolidado completo.
 * Inclui todos os dados: receita, despesas, lucro, comissões, etc.
 * 
 * @param filters - Filtros de data
 * @returns Relatório financeiro completo
 */
export async function getCompleteFinancialReport(
  filters: DateRangeFilter
): Promise<CompleteFinancialData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<CompleteFinancialData>>(
    `/reports/financial/complete${queryString}`
  );
  return response.data.data;
}

// ============================================================================
// RELATÓRIOS DE AGENDAMENTOS
// ============================================================================

/**
 * GET /reports/appointments/stats
 * 
 * Busca estatísticas completas de agendamentos:
 * - Total e por status
 * - Distribuição por hora
 * - Performance por profissional
 * - Taxas de conclusão e cancelamento
 * 
 * @param filters - Filtros de data
 * @returns Estatísticas de agendamentos
 */
export async function getAppointmentStats(
  filters: DateRangeFilter
): Promise<AppointmentStatsData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<AppointmentStatsData>>(
    `/reports/appointments/stats${queryString}`
  );
  return response.data.data;
}

/**
 * GET /reports/appointments/occupancy
 * 
 * Busca taxa de ocupação por profissional.
 * Calcula horas ocupadas vs horas disponíveis.
 * 
 * @param filters - Filtros de data
 * @returns Taxa de ocupação
 */
export async function getOccupancyRate(
  filters: DateRangeFilter
): Promise<OccupancyData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<OccupancyData>>(
    `/reports/appointments/occupancy${queryString}`
  );
  return response.data.data;
}

// ============================================================================
// RELATÓRIOS DE PRODUTOS
// ============================================================================

/**
 * GET /reports/products/top-selling
 * 
 * Busca produtos mais vendidos com análise de margem de lucro.
 * 
 * @param filters - Filtros de data
 * @returns Produtos mais vendidos
 */
export async function getTopSellingProducts(
  filters: DateRangeFilter
): Promise<TopSellingProductsData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<TopSellingProductsData>>(
    `/reports/products/top-selling${queryString}`
  );
  return response.data.data;
}

/**
 * GET /reports/products/low-stock
 * 
 * Busca produtos com estoque baixo ou zerado.
 * Não requer filtros de data.
 * 
 * @returns Produtos com estoque baixo
 */
export async function getLowStockProducts(): Promise<LowStockData> {
  const response = await api.get<ApiResponse<LowStockData>>(
    '/reports/products/low-stock'
  );
  return response.data.data;
}

/**
 * GET /reports/products/stock-movement
 * 
 * Busca análise de movimentação de estoque.
 * Inclui entradas, saídas e ajustes.
 * 
 * @param filters - Filtros de data
 * @returns Movimentação de estoque
 */
export async function getStockMovement(
  filters: DateRangeFilter
): Promise<StockMovementData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<StockMovementData>>(
    `/reports/products/stock-movement${queryString}`
  );
  return response.data.data;
}

// ============================================================================
// RELATÓRIOS DE CLIENTES
// ============================================================================

/**
 * GET /reports/clients/analysis
 * 
 * Busca análise completa de clientes:
 * - Total, novos, ativos, inativos
 * - Taxa de retenção
 * - Top clientes por valor gasto
 * 
 * @param filters - Filtros de data
 * @returns Análise de clientes
 */
export async function getClientAnalysis(
  filters: DateRangeFilter
): Promise<ClientAnalysisData> {
  const queryString = buildQueryString(filters);
  const response = await api.get<ApiResponse<ClientAnalysisData>>(
    `/reports/clients/analysis${queryString}`
  );
  return response.data.data;
}

/**
 * GET /reports/clients/inactive
 * 
 * Busca clientes inativos para campanhas de reativação.
 * 
 * @param filters - Número de dias sem visita (padrão: 60)
 * @returns Clientes inativos
 */
export async function getInactiveClients(
  filters?: InactiveClientsFilter
): Promise<InactiveClientsData> {
  const queryString = buildQueryString(filters || {});
  const response = await api.get<ApiResponse<InactiveClientsData>>(
    `/reports/clients/inactive${queryString}`
  );
  return response.data.data;
}

/**
 * GET /reports/clients/loyalty
 * 
 * Busca análise do programa de fidelidade.
 * Não requer filtros de data.
 * 
 * @returns Análise de fidelidade
 */
export async function getLoyaltyAnalysis(): Promise<LoyaltyAnalysisData> {
  const response = await api.get<ApiResponse<LoyaltyAnalysisData>>(
    '/reports/clients/loyalty'
  );
  return response.data.data;
}

// ============================================================================
// RELATÓRIOS DE COMISSÕES
// ============================================================================

/**
 * GET /reports/commissions
 * 
 * Busca relatório de comissões.
 * Pode filtrar por profissional e/ou período.
 * 
 * @param filters - Filtros opcionais (staffId, startDate, endDate)
 * @returns Comissões e sumário
 * 
 * @example
 * ```typescript
 * // Todas as comissões
 * const all = await getCommissionsReport({});
 * 
 * // Por profissional
 * const byStaff = await getCommissionsReport({ staffId: 'uuid' });
 * 
 * // Por período
 * const byPeriod = await getCommissionsReport({
 *   startDate: '2025-12-01',
 *   endDate: '2025-12-31'
 * });
 * ```
 */
export async function getCommissionsReport(
  filters?: CommissionFilters
): Promise<CommissionsData> {
  const queryString = buildQueryString(filters || {});
  const response = await api.get<ApiResponse<CommissionsData>>(
    `/reports/commissions${queryString}`
  );
  return response.data.data;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export const reportsClient = {
  // Dashboard
  getDashboardMetrics,
  
  // Financeiro
  getRevenueByPeriod,
  getRevenueByPaymentMethod,
  getProfitableServices,
  getCompleteFinancialReport,
  
  // Agendamentos
  getAppointmentStats,
  getOccupancyRate,
  
  // Produtos
  getTopSellingProducts,
  getLowStockProducts,
  getStockMovement,
  
  // Clientes
  getClientAnalysis,
  getInactiveClients,
  getLoyaltyAnalysis,
  
  // Comissões
  getCommissionsReport,
  
  // Helpers
  formatDateForApi,
  getDateRangeForPeriod,
};

export default reportsClient;
