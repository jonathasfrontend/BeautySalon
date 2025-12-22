import api from '@/lib/api';
import {
  ApiResponse,
  FinancialReport,
  AppointmentReport,
  ProductReport,
  ClientReport,
  ReportFilters,
  DashboardStats,
} from '@/types';

class ReportService {
  /**
   * Formatar data para ISO 8601 (YYYY-MM-DD)
   */
  private formatDate(date?: string): string | undefined {
    if (!date) return undefined;
    // Se já estiver no formato correto, retorna
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Converte para ISO se necessário
    const d = new Date(date);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
  }

  /**
   * Obter relatório do dashboard
   */
  async getDashboardReport(
    filters: ReportFilters
  ): Promise<ApiResponse<DashboardStats>> {
    const params = new URLSearchParams();
    
    const startDate = this.formatDate(filters.startDate);
    const endDate = this.formatDate(filters.endDate);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/dashboard?${params.toString()}`);
    return response.data;
  }

  /**
   * Obter relatório financeiro
   */
  async getFinancialReport(
    filters: ReportFilters
  ): Promise<ApiResponse<FinancialReport>> {
    const params = new URLSearchParams();
    
    const startDate = this.formatDate(filters.startDate);
    const endDate = this.formatDate(filters.endDate);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/financial?${params.toString()}`);
    return response.data;
  }

  /**
   * Obter relatório de agendamentos
   */
  async getAppointmentReport(
    filters: ReportFilters
  ): Promise<ApiResponse<AppointmentReport>> {
    const params = new URLSearchParams();
    
    const startDate = this.formatDate(filters.startDate);
    const endDate = this.formatDate(filters.endDate);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (filters.staffId) params.append('staffId', filters.staffId);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/reports/appointments?${params.toString()}`);
    return response.data;
  }

  /**
   * Obter relatório de produtos
   */
  async getProductReport(
    filters: ReportFilters
  ): Promise<ApiResponse<ProductReport>> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);

    const response = await api.get(`/reports/products?${params.toString()}`);
    return response.data;
  }

  /**
   * Obter relatório de clientes
   */
  async getClientReport(
    filters: ReportFilters
  ): Promise<ApiResponse<ClientReport>> {
    const params = new URLSearchParams();
    
    const startDate = this.formatDate(filters.startDate);
    const endDate = this.formatDate(filters.endDate);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/clients?${params.toString()}`);
    return response.data;
  }

  /**
   * Exportar relatório em PDF
   */
  async exportToPDF(
    reportType: 'financial' | 'appointments' | 'products' | 'clients',
    filters: ReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams();
    
    const startDate = this.formatDate(filters.startDate);
    const endDate = this.formatDate(filters.endDate);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (filters.staffId) params.append('staffId', filters.staffId);
    if (filters.category) params.append('category', filters.category);

    const response = await api.get(
      `/reports/${reportType}/export/pdf?${params.toString()}`,
      { responseType: 'blob' }
    );
    
    return response.data;
  }

  /**
   * Exportar relatório em Excel
   */
  async exportToExcel(
    reportType: 'financial' | 'appointments' | 'products' | 'clients',
    filters: ReportFilters
  ): Promise<Blob> {
    const params = new URLSearchParams();
    
    const startDate = this.formatDate(filters.startDate);
    const endDate = this.formatDate(filters.endDate);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (filters.staffId) params.append('staffId', filters.staffId);
    if (filters.category) params.append('category', filters.category);

    const response = await api.get(
      `/reports/${reportType}/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    
    return response.data;
  }

  /**
   * Obter relatório de comissões
   */
  async getCommissionsReport(
    filters?: ReportFilters
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) {
      const startDate = this.formatDate(filters.startDate);
      if (startDate) params.append('startDate', startDate);
    }
    if (filters?.endDate) {
      const endDate = this.formatDate(filters.endDate);
      if (endDate) params.append('endDate', endDate);
    }
    if (filters?.staffId) params.append('staffId', filters.staffId);

    const queryString = params.toString();
    const url = queryString ? `/reports/commissions?${queryString}` : '/reports/commissions';
    
    const response = await api.get(url);
    return response.data;
  }
}

export const reportService = new ReportService();
