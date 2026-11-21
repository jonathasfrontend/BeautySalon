import api from '@/lib/api';
import type { PaginatedResponse } from '@/types';

/** Empresa é recurso de plataforma: não carrega companyId (D-0B.6). */
export interface Company {
  id: string;
  name: string;
  document: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  document?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface UpdateCompanyData {
  name?: string;
  document?: string | null;
  timezone?: string;
  isActive?: boolean;
}

class CompaniesService {
  /** GET /companies — envelope {status, data, pagination}. */
  async list(page: number, limit: number) {
    const response = await api.get<PaginatedResponse<Company>>('/companies', {
      params: { page, limit },
    });

    return {
      items: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async create(data: CreateCompanyData): Promise<Company> {
    const response = await api.post<{ status: 'success'; data: Company }>(
      '/companies',
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateCompanyData): Promise<Company> {
    const response = await api.put<{ status: 'success'; data: Company }>(
      `/companies/${id}`,
      data
    );
    return response.data.data;
  }
}

export const companiesService = new CompaniesService();
