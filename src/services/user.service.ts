import api from '@/lib/api';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  ApiResponse,
} from '@/types';

class UserService {
  /**
   * Get all users
   */
  async getUsers(params?: { 
    isActive?: boolean; 
    roleId?: string; 
    search?: string;
  }): Promise<User[]> {
    const response = await api.get<ApiResponse<{ users: User[] }>>('/users', { params });
    return response.data.data?.users || [];
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    const data = response.data.data as any;
    return data?.user || data;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User }>>('/users', data);
    const responseData = response.data.data as any;
    return responseData?.user || responseData;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}`, data);
    const responseData = response.data.data as any;
    return responseData?.user || responseData;
  }

  /**
   * Change user password
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    await api.put(`/users/${id}/password`, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}/activate`);
    const responseData = response.data.data as any;
    return responseData?.user || responseData;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}/deactivate`);
    const responseData = response.data.data as any;
    return responseData?.user || responseData;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  /**
   * Get users without staff profile (available to become staff)
   */
  async getUsersWithoutStaff(roleId?: string): Promise<User[]> {
    const params: any = { isActive: true };
    if (roleId) {
      params.roleId = roleId;
    }
    
    const users = await this.getUsers(params);
    // Filtrar apenas usuários que não têm staff associado
    return users.filter(user => !user.staff);
  }
}

export const userService = new UserService();
