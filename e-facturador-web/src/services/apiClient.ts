import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenService } from './tokenService';
import { AuthService } from './authService';

// Create main API instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
  withCredentials: true, // This ensures cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenService.getToken();
    
    // Enhanced debugging
    console.group(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
    console.log('🎫 Token exists:', !!token);
    console.log('🎫 Token preview:', token ? `${token.substring(0, 20)}...` : 'None');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.warn('❌ No token available or headers missing');
    }
    
    console.log('📤 Request headers:', config.headers);
    console.log('📦 Request data:', config.data);
    console.groupEnd();
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Response Error]', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const newToken = await AuthService.refreshToken();
        
        if (newToken) {
          processQueue(null, newToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          return apiClient(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Redirect to login
        AuthService.logout();
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other HTTP errors
    const errorMessage = getErrorMessage(error);
    
    // Create enhanced error object
    const enhancedError = {
      ...error,
      message: errorMessage,
      isNetworkError: !error.response,
      status: error.response?.status,
      data: error.response?.data,
    };
    
    return Promise.reject(enhancedError);
  }
);

// Helper function to extract meaningful error messages
const getErrorMessage = (error: AxiosError): string => {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data as any;
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (data?.message) {
      return data.message;
    }
    
    if (data?.error) {
      return data.error;
    }
    
    // Default messages for common HTTP status codes
    switch (error.response.status) {
      case 400:
        return 'Solicitud inválida. Verifique los datos enviados.';
      case 401:
        return 'No autorizado. Por favor, inicie sesión nuevamente.';
      case 403:
        return 'No tiene permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto. El recurso ya existe o está en uso.';
      case 422:
        return 'Datos de entrada inválidos.';
      case 500:
        return 'Error interno del servidor. Intente nuevamente más tarde.';
      case 502:
        return 'Error de conexión con el servidor.';
      case 503:
        return 'Servicio no disponible temporalmente.';
      default:
        return `Error del servidor (${error.response.status}).`;
    }
  } else if (error.request) {
    // Network error
    return 'Error de conexión. Verifique su conexión a internet.';
  } else {
    // Other error
    return error.message || 'Error inesperado.';
  }
};

// Utility functions for common API patterns
export const apiUtils = {
  // GET request with error handling
  get: async <T = any>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },
  
  // POST request with error handling
  post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },
  
  // PUT request with error handling
  put: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },
  
  // DELETE request with error handling
  delete: async <T = any>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
  
  // Upload file with progress
  upload: async <T = any>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    
    return response.data;
  },
};

export default apiClient;