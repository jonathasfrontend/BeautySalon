import api from '@/lib/api';
import type {
  Product,
  CreateProductData,
  ApiResponse,
} from '@/types';

class ProductService {
  /**
   * Get all products
   */
  async getProducts(params?: { category?: string; lowStock?: boolean; search?: string }): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>('/products', { params });
    return response.data.data!;
  }

  // Alias for getProducts
  async getAll(params?: any): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await api.get<ApiResponse<{ product: Product }>>(`/products/${id}`);
    // A API retorna { data: { product: {...} } }
    return response.data.data?.product || response.data.data as any;
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductData | any): Promise<Product> {
    const response = await api.post<ApiResponse<{ product: Product }>>('/products', data);
    // A API pode retornar { data: { product: {...} } } ou { data: {...} }
    return response.data.data?.product || response.data.data as any;
  }

  // Alias for createProduct
  async create(data: any): Promise<Product> {
    return this.createProduct(data);
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: Partial<CreateProductData> | any): Promise<Product> {
    const response = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, data);
    // A API pode retornar { data: { product: {...} } } ou { data: {...} }
    return response.data.data?.product || response.data.data as any;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  /**
   * Add stock
   */
  async addStock(id: string, quantity: number, reason: string, reference?: string): Promise<Product> {
    const response = await api.post<ApiResponse<{ product: Product }>>(`/products/${id}/stock/add`, {
      quantity,
      reason,
      reference,
    });
    // A API pode retornar { data: { product: {...} } } ou { data: {...} }
    return response.data.data?.product || response.data.data as any;
  }

  /**
   * Remove stock
   */
  async removeStock(id: string, quantity: number, reason: string): Promise<Product> {
    const response = await api.post<ApiResponse<{ product: Product }>>(`/products/${id}/stock/remove`, {
      quantity,
      reason,
    });
    // A API pode retornar { data: { product: {...} } } ou { data: {...} }
    return response.data.data?.product || response.data.data as any;
  }

  /**
   * Get stock movements
   */
  async getMovements(id: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/products/${id}/movements`);
    return response.data.data!;
  }
}

export const productService = new ProductService();
