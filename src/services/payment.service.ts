import api from '@/lib/api';
import type {
  Payment,
  CreatePaymentData,
  ApiResponse,
} from '@/types';

interface PaymentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

class PaymentService {
  /**
   * Get all payments
   */
  async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    const response = await api.get<ApiResponse<Payment[]>>('/payments', {
      params: filters,
    });
    return response.data.data!;
  }

  // Alias for getPayments
  async getAll(filters?: any): Promise<ApiResponse<Payment[]>> {
    const response = await api.get<ApiResponse<Payment[]>>('/payments', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data!;
  }

  /**
   * Create new payment
   */
  async createPayment(data: CreatePaymentData | any): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>('/payments', data);
    return response.data.data!;
  }

  // Alias for createPayment
  async create(data: any): Promise<Payment> {
    return this.createPayment(data);
  }

  /**
   * Confirm payment
   */
  async confirmPayment(id: string): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>(`/payments/${id}/confirm`);
    return response.data.data!;
  }

  /**
   * Refund payment
   */
  async refundPayment(id: string): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>(`/payments/${id}/refund`);
    return response.data.data!;
  }

  /**
   * Get payment report
   */
  async getReport(filters?: PaymentFilters): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/payments/report', {
      params: filters,
    });
    return response.data.data!;
  }
}

export const paymentService = new PaymentService();
