import api from '@/lib/api';
import type {
  Staff,
  CreateStaffData,
  ApiResponse,
} from '@/types';

class StaffService {
  /**
   * Get all staff
   */
  async getStaff(params?: { specialty?: string; isAvailable?: boolean; search?: string }): Promise<Staff[]> {
    const response = await api.get<ApiResponse<Staff[] | { staffs: Staff[] }>>('/staff', { params });
    // A API pode retornar { data: [...] } ou { data: { staffs: [...] } }
    const data = response.data.data;
    return Array.isArray(data) ? data : (data as any)?.staffs || [];
  }

  // Alias for getStaff
  async getAll(params?: { specialty?: string; isAvailable?: boolean; search?: string }): Promise<ApiResponse<Staff[]>> {
    const response = await api.get<ApiResponse<Staff[] | { staffs: Staff[] }>>('/staff', { params });
    const data = response.data.data;
    const staffList = Array.isArray(data) ? data : (data as any)?.staffs || [];
    return {
      ...response.data,
      data: staffList
    };
  }

  /**
   * Get staff by ID
   */
  async getStaffById(id: string): Promise<Staff> {
    const response = await api.get<ApiResponse<{ staff: Staff }>>(`/staff/${id}`);
    return (response.data.data as any)?.staff || response.data.data!;
  }

  // Alias for getStaffById
  async getById(id: string): Promise<ApiResponse<Staff>> {
    const response = await api.get<ApiResponse<{ staff: Staff }>>(`/staff/${id}`);
    // A API retorna { data: { staff: {...} } }, então precisamos extrair o staff
    const staffData = (response.data.data as any)?.staff || response.data.data;
    return {
      ...response.data,
      data: staffData
    };
  }

  /**
   * Create new staff
   */
  async createStaff(data: CreateStaffData | any): Promise<Staff> {
    const response = await api.post<ApiResponse<Staff>>('/staff', data);
    return response.data.data!;
  }

  // Alias for createStaff
  async create(data: any): Promise<Staff> {
    return this.createStaff(data);
  }

  /**
   * Update staff
   */
  async updateStaff(id: string, data: Partial<CreateStaffData> | any): Promise<Staff> {
    const response = await api.put<ApiResponse<{ staff: Staff }>>(`/staff/${id}`, data);
    return (response.data.data as any)?.staff || response.data.data!;
  }

  // Alias for updateStaff
  async update(id: string, data: any): Promise<Staff> {
    return this.updateStaff(id, data);
  }

  /**
   * Delete staff
   */
  async deleteStaff(id: string): Promise<void> {
    await api.delete(`/staff/${id}`);
  }

  // Alias for deleteStaff
  async delete(id: string): Promise<void> {
    return this.deleteStaff(id);
  }

  /**
   * Get staff availability
   */
  async getAvailability(id: string, date: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/staff/${id}/availability`, {
      params: { date },
    });
    return response.data.data!;
  }

  /**
   * Get staff schedule
   */
  async getSchedule(id: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/staff/${id}/schedule`);
    return response.data.data!;
  }
}

export const staffService = new StaffService();
