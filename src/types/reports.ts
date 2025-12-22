/**
 * Types para o Sistema de Relatórios
 * Baseado nas respostas da API conforme ROUTES.md e postman_collection.json
 */

// ============================================================================
// TYPES BASE
// ============================================================================

export interface Period {
  start: string;
  end: string;
  days?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// ============================================================================
// DASHBOARD GERAL
// ============================================================================

export interface DashboardData {
  period: Period;
  appointments: {
    total: number;
  };
  revenue: {
    total: number;
    count: number;
  };
  expenses: {
    total: number;
  };
  profit: number;
  newClients: number;
}

// ============================================================================
// RELATÓRIOS FINANCEIROS
// ============================================================================

export interface RevenueByPeriodData {
  period: Period;
  current: {
    revenue: number;
    expenses: number;
    profit: number;
    transactionCount: number;
  };
  previous: {
    revenue: number;
    expenses: number;
    profit: number;
    transactionCount: number;
  };
  comparison: {
    revenueGrowth: number;
    profitGrowth: number;
    expensesGrowth: number;
  };
  dailyData: DailyFinancialData[];
  expenseDetails: ExpenseDetail[];
}

export interface DailyFinancialData {
  date: string;
  revenue: number;
  despesas: number;
  lucro: number;
}

export interface ExpenseDetail {
  id: string;
  description: string;
  category: string;
  amount: number;
  paidDate: string;
}

export interface PaymentMethodData {
  period: Period;
  total: number;
  methods: PaymentMethod[];
}

export interface PaymentMethod {
  method: 'PIX' | 'CREDIT' | 'DEBIT' | 'CASH';
  total: number;
  count: number;
  percentage: number;
}

export interface ProfitableServicesData {
  period: Period;
  totalRevenue: number;
  services: ServiceRevenue[];
}

export interface ServiceRevenue {
  serviceId: string;
  serviceName: string;
  totalRevenue: number;
  timesBooked: number;
  averagePrice: number;
  percentage: number;
}

export interface CompleteFinancialData {
  summary: {
    revenue: number;
    expenses: number;
    profit: number;
    commissions: number;
    netProfit: number;
  };
  revenueByPeriod: RevenueByPeriodData;
  revenueByMethod: PaymentMethodData;
  profitableServices: ProfitableServicesData;
  commissions: {
    total: number;
    count: number;
  };
}

// ============================================================================
// RELATÓRIOS DE AGENDAMENTOS
// ============================================================================

export interface AppointmentStatsData {
  period: Period;
  summary: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
    cancellationRate: number;
  };
  byStatus: StatusCount[];
  byHour: HourCount[];
  byStaff: StaffAppointmentStats[];
}

export interface StatusCount {
  status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'SCHEDULED' | 'CONFIRMED';
  count: number;
  percentage: number;
}

export interface HourCount {
  hour: number;
  count: number;
}

export interface StaffAppointmentStats {
  staffId: string;
  staffName: string;
  appointmentsCount: number;
  totalRevenue: number;
  averageTicket: number;
}

export interface OccupancyData {
  period: Period;
  overall: {
    totalStaff: number;
    averageOccupancy: number;
    totalAvailableHours: number;
  };
  byStaff: StaffOccupancy[];
}

export interface StaffOccupancy {
  staffId: string;
  staffName: string;
  appointmentsCount: number;
  occupiedHours: number;
  availableHours: number;
  occupancyRate: number;
}

// ============================================================================
// RELATÓRIOS DE PRODUTOS
// ============================================================================

export interface TopSellingProductsData {
  period: Period;
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalItemsSold: number;
  };
  products: TopSellingProduct[];
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  timesOrdered: number;
  revenuePercentage: number;
}

export interface LowStockData {
  summary: {
    total: number;
    critical: number;
    lowStock: number;
  };
  products: LowStockProduct[];
}

export interface LowStockProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reorderThreshold: number;
  supplier: string;
  costPrice: number;
  salePrice: number;
  status: 'OUT_OF_STOCK' | 'LOW_STOCK';
  reorderQuantity: number;
}

export interface StockMovementData {
  period: Period;
  summary: {
    totalMovements: number;
    byType: {
      IN?: MovementTypeSummary;
      OUT?: MovementTypeSummary;
      ADJUSTMENT?: MovementTypeSummary;
    };
  };
  byProduct: ProductMovement[];
}

export interface MovementTypeSummary {
  count: number;
  quantity: number;
  value: number;
}

export interface ProductMovement {
  productId: string;
  productName: string;
  category: string;
  in: number;
  out: number;
  adjustment: number;
}

// ============================================================================
// RELATÓRIOS DE CLIENTES
// ============================================================================

export interface ClientAnalysisData {
  period: Period;
  summary: {
    total: number;
    new: number;
    active: number;
    inactive: number;
    retentionRate: number;
  };
  topClients: TopClient[];
}

export interface TopClient {
  clientId: string;
  clientName: string;
  clientPhone: string;
  totalSpent: number;
  transactionCount: number;
  loyaltyPoints: number;
  averageTicket: number;
}

export interface InactiveClientsData {
  daysInactive: number;
  summary: {
    total: number;
    potentialRevenue: number;
  };
  clients: InactiveClient[];
}

export interface InactiveClient {
  clientId: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  daysSinceLastVisit: number;
  totalSpent: number;
  appointmentsCount: number;
  loyaltyPoints: number;
}

export interface LoyaltyAnalysisData {
  summary: {
    totalPointsInCirculation: number;
    clientsWithPoints: number;
  };
  topLoyalClients: LoyalClient[];
}

export interface LoyalClient {
  clientId: string;
  name: string;
  phone: string;
  points: number;
  appointmentsCount: number;
  memberSince: string;
}

// ============================================================================
// RELATÓRIOS DE COMISSÕES
// ============================================================================

export interface CommissionsData {
  commissions: Commission[];
  summary: {
    total: number;
    paid: number;
    pending: number;
  };
}

export interface Commission {
  id: string;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
  staff: {
    id: string;
    user: {
      name: string;
    };
  };
  payment: {
    id: string;
    amount: number;
    appointment: {
      startTime: string;
    };
  };
}

// ============================================================================
// FILTROS E PARÂMETROS
// ============================================================================

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface CommissionFilters extends DateRangeFilter {
  staffId?: string;
}

export interface InactiveClientsFilter {
  daysInactive?: number;
}

// ============================================================================
// CHART DATA TYPES (para uso nos componentes de gráficos)
// ============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface MultiSeriesChartData {
  name: string;
  [key: string]: string | number;
}

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

// ============================================================================
// UI HELPERS
// ============================================================================

export type ReportPeriodPreset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface ReportFilters extends DateRangeFilter {
  period?: ReportPeriodPreset;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
}
