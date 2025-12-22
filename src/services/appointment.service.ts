import api from '@/lib/api';
import type {
  Appointment,
  CreateAppointmentData,
  AppointmentFilters,
  AppointmentStats,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

class AppointmentService {
  /**
   * Get all appointments with filters
   */
  async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments', {
      params: filters,
    });
    return response.data.data!;
  }

  // Alias for getAppointments
  async getAll(filters?: any): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data.data!;
  }

  // Alias for getAppointmentById
  async getById(id: string): Promise<ApiResponse<Appointment>> {
    const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data;
  }

  /**
   * Create new appointment
   */
  async createAppointment(data: CreateAppointmentData | any): Promise<Appointment> {
    const response = await api.post<ApiResponse<Appointment>>('/appointments', data);
    return response.data.data!;
  }

  // Alias for createAppointment
  async create(data: any): Promise<Appointment> {
    return this.createAppointment(data);
  }

  /**
   * Update appointment
   */
  async updateAppointment(id: string, data: Partial<CreateAppointmentData>): Promise<Appointment> {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, data);
    return response.data.data!;
  }

  // Alias for updateAppointment
  async update(id: string, data: any): Promise<Appointment> {
    return this.updateAppointment(id, data);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string): Promise<void> {
    await api.post(`/appointments/${id}/cancel`);
  }

  // Alias for cancelAppointment
  async cancel(id: string): Promise<void> {
    return this.cancelAppointment(id);
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(id: string): Promise<void> {
    await api.post(`/appointments/${id}/no-show`);
  }

  /**
   * Get availability slots for staff on a date
   */
  async getAvailability(staffId: string, date: string): Promise<Appointment[]> {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments/availability', {
      params: { staffId, date },
    });
    return response.data.data!;
  }

  /**
   * Get appointment statistics
   */
  async getStats(filters?: AppointmentFilters): Promise<AppointmentStats> {
    const response = await api.get<ApiResponse<AppointmentStats>>('/appointments/stats', {
      params: filters,
    });
    return response.data.data!;
  }
}

export const appointmentService = new AppointmentService();
