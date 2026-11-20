import api from '@/lib/api';
import type { Role, Permission, ApiResponse } from '@/types';

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignPermissionsData {
  permissionIds: string[];
}

export interface RoleWithPermissions extends Role {
  permissions?: Permission[];
  _count?: {
    users: number;
  };
}

class RoleService {
  /**
   * Get all roles
   */
  async getRoles(): Promise<RoleWithPermissions[]> {
    const response = await api.get<ApiResponse<RoleWithPermissions[]>>('/roles');
    const data = response.data.data as any;
    
    // Backend retorna array diretamente em data, não em data.roles
    const rolesArray = Array.isArray(data) ? data : (data?.roles || []);
    
    // Transformar rolePermissions em permissions
    return rolesArray.map((role: any) => ({
      ...role,
      permissions: role.rolePermissions?.map((rp: any) => rp.permission) || [],
    }));
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<RoleWithPermissions> {
    const response = await api.get<ApiResponse<RoleWithPermissions>>(`/roles/${id}`);
    const data = response.data.data as any;
    
    // Transformar rolePermissions em permissions
    return {
      ...data,
      permissions: data.rolePermissions?.map((rp: any) => rp.permission) || [],
    };
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<RoleWithPermissions | undefined> {
    const roles = await this.getRoles();
    return roles.find(role => role.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    const response = await api.post<ApiResponse<{ role: Role }>>('/roles', data);
    const responseData = response.data.data as any;
    return responseData?.role || responseData;
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    const response = await api.put<ApiResponse<{ role: Role }>>(`/roles/${id}`, data);
    const responseData = response.data.data as any;
    return responseData?.role || responseData;
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>('/roles/permissions');
    const data = response.data.data as any;
    
    // Backend retorna array diretamente em data, não em data.permissions
    return Array.isArray(data) ? data : (data?.permissions || []);
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>(`/roles/${roleId}/permissions`);
    const data = response.data.data as any;
    
    // Backend retorna array diretamente em data, não em data.permissions
    return Array.isArray(data) ? data : (data?.permissions || []);
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(roleId: string, data: AssignPermissionsData): Promise<Role> {
    const response = await api.put<ApiResponse<{ role: Role }>>(`/roles/${roleId}/permissions`, data);
    const responseData = response.data.data as any;
    return responseData?.role || responseData;
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(roleId: string, userId: string): Promise<void> {
    await api.post(`/roles/${roleId}/assign/${userId}`);
  }

  /**
   * Assign role to staff (atribui ao user do staff)
   */
  async assignRoleToStaff(staffId: string, roleId: string): Promise<void> {
    // Endpoint dedicado: valida que staffId é um staff.id real (nunca userId
    // de item pendente) e aplica o cargo no usuário do profissional.
    await api.post(`/staff/${staffId}/assign-role`, { roleId });
  }

  /**
   * Get permissions grouped by module
   */
  groupPermissionsByModule(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((acc, permission) => {
      const module = permission.module;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }
}

export const roleService = new RoleService();
