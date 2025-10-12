import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse } from '../models/auth';
import { TokenService } from './tokenService';

// Create an axios instance for auth-related requests
const authApi = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class AuthService {
  
  /**
   * Login user with credentials
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await authApi.post('/api/auth/login', credentials);
      
      if (response.data && response.data.token) {
        // Store token and user data securely
        TokenService.setToken(response.data.token);
        TokenService.setUser({
          username: response.data.username,
          empresaId: response.data.empresaId,
          sucursalId: response.data.sucursalId,
          isAuthenticated: true,
        });
        
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'Credenciales inválidas';
        throw new Error(message);
      } else if (error.request) {
        // Network error
        throw new Error('Error de conexión. Verifique su conexión a internet.');
      } else {
        // Other error
        throw new Error('Error inesperado durante el login');
      }
    }
  }

  /**
   * Logout user and clear stored data
   */
  static logout(): void {
    TokenService.removeToken();
    // Optional: Call backend logout endpoint if needed
    // authApi.post('/api/auth/logout');
  }

  /**
   * Get current user from storage
   */
  static getCurrentUser(): any | null {
    return TokenService.getUser();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenService.isTokenValid();
  }

  /**
   * Refresh token (if your backend supports it)
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const currentToken = TokenService.getToken();
      if (!currentToken) return null;

      // Call your refresh token endpoint
      const response: AxiosResponse<{ token: string }> = await authApi.post('/api/auth/refresh', {
        token: currentToken,
      });

      if (response.data && response.data.token) {
        TokenService.setToken(response.data.token);
        return response.data.token;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout(); // If refresh fails, logout user
      return null;
    }
  }

  /**
   * Get authorization header for API requests
   */
  static getAuthHeader(): { Authorization: string } | {} {
    const token = TokenService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Validate current session
   */
  static async validateSession(): Promise<boolean> {
    try {
      const token = TokenService.getToken();
      if (!token) return false;

      // Optional: Call backend to validate token
      await authApi.get('/api/auth/validate', {
        headers: this.getAuthHeader(),
      });
      
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      this.logout();
      return false;
    }
  }
}