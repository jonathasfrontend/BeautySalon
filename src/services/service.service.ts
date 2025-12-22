import api from '@/lib/api';
import type {
  Service,
  CreateServiceData,
  ApiResponse,
} from '@/types';

class ServiceService {
  /**
   * Get all services
   */
  async getServices(params?: { category?: string; isActive?: boolean }): Promise<Service[]> {
    const response = await api.get<ApiResponse<Service[]>>('/services', { params });
    return response.data.data!;
  }

  // Alias for getServices
  async getAll(params?: { category?: string; isActive?: boolean }): Promise<ApiResponse<Service[]>> {
    const response = await api.get<ApiResponse<Service[]>>('/services', { params });
    return response.data;
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    const response = await api.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data.data!;
  }

  // Alias for getServiceById
  async getById(id: string): Promise<ApiResponse<Service>> {
    const response = await api.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data;
  }

  /**
   * Create new service
   */
  async createService(data: CreateServiceData): Promise<Service> {
    const response = await api.post<ApiResponse<Service>>('/services', data);
    return response.data.data!;
  }

  // Alias for createService
  async create(data: any): Promise<Service> {
    return this.createService(data);
  }

  /**
   * Update service
   */
  async updateService(id: string, data: Partial<CreateServiceData>): Promise<Service> {
    const response = await api.put<ApiResponse<Service>>(`/services/${id}`, data);
    return response.data.data!;
  }

  // Alias for updateService
  async update(id: string, data: any): Promise<Service> {
    return this.updateService(id, data);
  }

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  }

  // Alias for deleteService
  async delete(id: string): Promise<void> {
    return this.deleteService(id);
  }

  /**
   * Get service categories
   */
  async getCategories(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/services/categories');
    return response.data.data!;
  }
}

export const serviceService = new ServiceService();
