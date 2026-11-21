import api from '@/lib/api';
import { setCookie, deleteCookie } from '@/lib/cookies';
import type {
  LoginCredentials,
  AuthResponse,
  ApiResponse,
  User,
} from '@/types';

const TOKEN_KEY = 'auth_token';

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const data = response.data.data!;

    this.setAccessToken(data.accessToken);
    return data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get current user with permissions
   */
  async getCurrentUser(): Promise<User & { permissions: string[] }> {
    const response = await api.get<ApiResponse<User & { permissions: string[] }>>('/auth/me');
    return response.data.data!;
  }

  /**
   * Set access token in cookie only
   */
  setAccessToken(token: string): void {
    setCookie(TOKEN_KEY, token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      sameSite: 'strict',
    });
  }

  /**
   * Get access token from cookie
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith(`${TOKEN_KEY}=`));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    deleteCookie(TOKEN_KEY);
  }
}

export const authService = new AuthService();
