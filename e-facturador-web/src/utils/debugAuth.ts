import { TokenService } from '../services/tokenService';

export class AuthDebugger {
  static logAuthState() {
    console.group('🔍 Auth Debug Information');
    
    const token = TokenService.getToken();
    const user = TokenService.getUser();
    const isValid = TokenService.isTokenValid();
    
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'None');
    console.log('User data:', user);
    console.log('Token is valid:', isValid);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000));
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    
    console.groupEnd();
  }
  
  static logRequestHeaders() {
    const token = TokenService.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    console.group('📤 Request Headers');
    console.log('Headers that should be sent:', headers);
    console.groupEnd();
    
    return headers;
  }
}

// Add to window for easy debugging in browser console
(window as any).authDebugger = AuthDebugger;