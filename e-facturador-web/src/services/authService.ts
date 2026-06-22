import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, SelectEmpresaSoporteRequest, SelectSucursalRequest } from '../models/auth';
import { TokenService } from './tokenService';

const authApi = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class AuthService {

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await authApi.post('/api/auth/login', credentials);

      if (response.data.requiresSucursalSelection) {
        // El usuario tiene múltiples sucursales: no guardamos token aún
        return response.data;
      }

      if (response.data.requiresEmpresaSoporteSelection) {
        // Usuario soporte con múltiples empresas: no guardamos token aún
        return response.data;
      }

      if (response.data?.token) {
        TokenService.setToken(response.data.token);
        TokenService.setUser({
          username: response.data.username,
          empresaId: response.data.empresaId,
          sucursalId: response.data.sucursalId,
          sucursalNombre: response.data.sucursalNombre,
          empresaNombre: response.data.empresaNombre,
          isAuthenticated: true,
          esSoporte: response.data.esSoporte ?? false,
        });
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data?.message || 'Credenciales inválidas';
        throw new Error(message);
      } else if (error.request) {
        throw new Error('Error de conexión. Verifique su conexión a internet.');
      } else {
        throw new Error('Error inesperado durante el login');
      }
    }
  }

  static async selectSucursal(preAuthToken: string, sucursalId: number): Promise<LoginResponse> {
    try {
      const body: SelectSucursalRequest = { preAuthToken, sucursalId };
      const response: AxiosResponse<LoginResponse> = await authApi.post('/api/auth/select-sucursal', body);

      if (response.data?.token) {
        TokenService.setToken(response.data.token);
        TokenService.setUser({
          username: response.data.username,
          empresaId: response.data.empresaId!,
          sucursalId: response.data.sucursalId,
          sucursalNombre: response.data.sucursalNombre,
          empresaNombre: response.data.empresaNombre,
          isAuthenticated: true,
          esSoporte: response.data.esSoporte ?? false,
        });
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error al seleccionar sucursal');
      }
      throw new Error('Error de conexión.');
    }
  }

  static async selectEmpresaSoporte(preAuthToken: string, empresaIdDestino: number): Promise<LoginResponse> {
    try {
      const body: SelectEmpresaSoporteRequest = { preAuthToken, empresaIdDestino };
      const response: AxiosResponse<LoginResponse> = await authApi.post('/api/auth/select-empresa-soporte', body);

      if (response.data?.token) {
        TokenService.setToken(response.data.token);
        TokenService.setUser({
          username: response.data.username,
          empresaId: response.data.empresaId!,
          sucursalId: response.data.sucursalId,
          sucursalNombre: response.data.sucursalNombre,
          empresaNombre: response.data.empresaNombre,
          isAuthenticated: true,
          esSoporte: true,
        });
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error al seleccionar empresa de soporte');
      }
      throw new Error('Error de conexión.');
    }
  }

  static async solicitarRecuperacion(email: string): Promise<void> {
    await authApi.post('/api/auth/recuperar-password/solicitar', { email });
  }

  static async verificarRecuperacion(email: string, codigo: string, passwordNueva: string): Promise<void> {
    await authApi.post('/api/auth/recuperar-password/verificar', { email, codigo, passwordNueva });
  }

  static async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void> {
    const token = TokenService.getToken();
    await authApi.post(
      '/api/auth/cambiar-password',
      { passwordActual, passwordNueva },
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
    try {
      const currentToken = TokenService.getToken();
      if (!currentToken) return null;

      const response: AxiosResponse<{ token: string }> = await authApi.post('/api/auth/refresh', {
        token: currentToken,
      });

      if (response.data?.token) {
        TokenService.setToken(response.data.token);
        return response.data.token;
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  }

  static getAuthHeader(): { Authorization: string } | {} {
    const token = TokenService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async validateSession(): Promise<boolean> {
    try {
      const token = TokenService.getToken();
      if (!token) return false;

      const response: AxiosResponse<LoginResponse> = await authApi.get('/api/auth/validate', {
        headers: this.getAuthHeader(),
      });

      // Actualizar datos de nombre en el user almacenado si el token los trae
      if (response.data) {
        const stored = TokenService.getUser();
        if (stored) {
          TokenService.setUser({
            ...stored,
            sucursalNombre: response.data.sucursalNombre,
            empresaNombre: response.data.empresaNombre,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      this.logout();
      return false;
    }
  }
}
