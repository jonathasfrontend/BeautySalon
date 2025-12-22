import api from '@/lib/api';
import type {
  WaitlistEntry,
  CreateWaitlistData,
  UpdateWaitlistData,
  WaitlistFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

class WaitlistService {
  /**
   * Get all waitlist entries with pagination and filters
   */
  async getAll(filters?: WaitlistFilters): Promise<PaginatedResponse<WaitlistEntry>> {
    const response = await api.get<PaginatedResponse<WaitlistEntry>>('/waitlist', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get waitlist entry by ID
   */
  async getById(id: string): Promise<WaitlistEntry> {
    const response = await api.get<ApiResponse<any>>(`/waitlist/${id}`);
    // A API retorna { status: "success", data: { entry: {...} } }
    const data = response.data.data;
    return data.entry || data;
  }

  /**
   * Create new waitlist entry
   */
  async create(data: CreateWaitlistData): Promise<WaitlistEntry> {
    const response = await api.post<ApiResponse<any>>('/waitlist', data);
    // A API pode retornar diretamente ou dentro de um objeto
    const responseData = response.data.data;
    return responseData.entry || responseData;
  }

  /**
   * Update waitlist entry
   */
  async update(id: string, data: UpdateWaitlistData): Promise<WaitlistEntry> {
    const response = await api.put<ApiResponse<any>>(`/waitlist/${id}`, data);
    // A API pode retornar diretamente ou dentro de um objeto
    const responseData = response.data.data;
    return responseData.entry || responseData;
  }

  /**
   * Delete waitlist entry
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/waitlist/${id}`);
  }

  /**
   * Mark as contacted
   */
  async markAsContacted(id: string): Promise<WaitlistEntry> {
    const response = await api.post<ApiResponse<any>>(`/waitlist/${id}/contact`);
    // A API pode retornar diretamente ou dentro de um objeto
    const responseData = response.data.data;
    return responseData.entry || responseData;
  }

  /**
   * Get pending waitlist entries (not contacted)
   */
  async getPending(): Promise<WaitlistEntry[]> {
    const response = await api.get<PaginatedResponse<WaitlistEntry>>('/waitlist', {
      params: { isContacted: false },
    });
    return response.data.data;
  }
}

export const waitlistService = new WaitlistService();
