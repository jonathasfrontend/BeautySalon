import api from '@/lib/api';
import type {
  Client,
  CreateClientData,
  UpdateClientData,
  ClientHistory,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@/types';

interface ClientFilters extends PaginationParams {
  search?: string;
  isBlocked?: boolean;
}

class ClientService {
  /**
   * Get all clients with pagination and filters
   */
  async getClients(filters?: ClientFilters, signal?: AbortSignal): Promise<PaginatedResponse<Client>> {
    const response = await api.get<PaginatedResponse<Client>>('/clients', {
      params: filters,
      signal,
    });
    return response.data;
  }

  // Alias for getClients
  async getAll(filters?: ClientFilters, signal?: AbortSignal): Promise<PaginatedResponse<Client>> {
    return this.getClients(filters, signal);
  }

  /**
   * Get client by ID
   */
  async getClientById(id: string): Promise<Client> {
    const response = await api.get<ApiResponse<any>>(`/clients/${id}`);
    // A API pode retornar { client, appointments, payments } ou apenas o client
    const data = response.data.data;
    return data?.client || data;
  }

  // Alias for getClientById
  async getById(id: string): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>(`/clients/${id}`);
    return response.data;
  }

  /**
   * Create new client
   */
  async createClient(data: CreateClientData): Promise<Client> {
    const response = await api.post<ApiResponse<Client>>('/clients', data);
    return response.data.data!;
  }

  // Alias for createClient
  async create(data: CreateClientData): Promise<Client> {
    return this.createClient(data);
  }

  /**
   * Update client
   */
  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data.data!;
  }

  // Alias for updateClient
  async update(id: string, data: UpdateClientData): Promise<Client> {
    return this.updateClient(id, data);
  }

  /**
   * Delete client
   */
  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  }

  // Alias for deleteClient
  async delete(id: string): Promise<void> {
    return this.deleteClient(id);
  }

  /**
   * Get client history
   */
  async getClientHistory(id: string): Promise<ClientHistory> {
    const response = await api.get<ApiResponse<ClientHistory>>(`/clients/${id}/history`);
    return response.data.data!;
  }

  // Alias for getClientHistory
  async getHistory(id: string): Promise<ApiResponse<ClientHistory>> {
    const response = await api.get<ApiResponse<ClientHistory>>(`/clients/${id}/history`);
    return response.data;
  }

  /**
   * Export clients CSV.
   * O CSV é gerado no servidor (permissão `clients.export`) — o frontend
   * apenas baixa o arquivo, sem montar planilha local.
   */
  async exportCsv(): Promise<{ blob: Blob; count: number }> {
    const response = await api.get('/clients/export', { responseType: 'blob' });
    const count = Number(response.headers['x-total-count'] ?? 0);
    return { blob: response.data as Blob, count };
  }

  /**
   * Get inactive clients
   */
  async getInactiveClients(days: number = 60): Promise<Client[]> {
    const response = await api.get<ApiResponse<Client[]>>('/clients/inactive', {
      params: { days },
    });
    return response.data.data!;
  }
}

export const clientService = new ClientService();
