// Mock login service for testing (replace authService.ts temporarily)
import { LoginRequest, LoginResponse } from '../models/auth';
import { TokenService } from './tokenService';

// Mock JWT token for testing
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImVtcHJlc2FJZCI6MSwiZXhwIjoxNzM5NTUwNTM1LCJpYXQiOjE2MTA0NDY1MzV9.mocked-signature';

export class AuthService {
  
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const response: LoginResponse = {
        token: MOCK_TOKEN,
        username: credentials.username,
        empresaId: 1,
        sucursalId: 1,
      };
      
      // Store token and user data
      TokenService.setToken(response.token);
      TokenService.setUser({
        username: response.username,
        empresaId: response.empresaId,
        sucursalId: response.sucursalId,
        isAuthenticated: true,
      });
      
      return response;
    } else {
      throw new Error('Credenciales inválidas. Use admin/admin123');
    }
  }

  static logout(): void {
    TokenService.removeToken();
  }

  static getCurrentUser(): any | null {
    return TokenService.getUser();
  }

  static isAuthenticated(): boolean {
    return TokenService.isTokenValid();
  }

  static async refreshToken(): Promise<string | null> {
    // Mock refresh - just return the same token
    const currentToken = TokenService.getToken();
    return currentToken;
  }

  static getAuthHeader(): { Authorization: string } | {} {
    const token = TokenService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async validateSession(): Promise<boolean> {
    return TokenService.isTokenValid();
  }
}

// For testing, use these credentials:
// Username: admin
// Password: admin123