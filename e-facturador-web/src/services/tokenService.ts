import CryptoJS from 'crypto-js';

// Encryption key - in production, get this from environment variables
const ENCRYPTION_KEY = process.env.REACT_APP_TOKEN_ENCRYPTION_KEY || 'your-secret-key-change-in-production';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export class TokenService {
  
  /**
   * Encrypts data before storing
   */
  private static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  /**
   * Decrypts stored data
   */
  private static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Stores JWT token securely in localStorage with encryption
   */
  static setToken(token: string): void {
    try {
      const encryptedToken = this.encrypt(token);
      localStorage.setItem(TOKEN_KEY, encryptedToken);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Retrieves and decrypts JWT token from localStorage
   */
  static getToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(TOKEN_KEY);
      if (!encryptedToken) return null;
      
      return this.decrypt(encryptedToken);
    } catch (error) {
      console.error('Error retrieving token:', error);
      this.removeToken(); // Remove corrupted token
      return null;
    }
  }

  /**
   * Removes JWT token from storage
   */
  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Stores user data securely
   */
  static setUser(user: any): void {
    try {
      const encryptedUser = this.encrypt(JSON.stringify(user));
      localStorage.setItem(USER_KEY, encryptedUser);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  /**
   * Retrieves user data
   */
  static getUser(): any | null {
    try {
      const encryptedUser = localStorage.getItem(USER_KEY);
      if (!encryptedUser) return null;
      
      const decryptedUser = this.decrypt(encryptedUser);
      return JSON.parse(decryptedUser);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      this.removeToken(); // Remove corrupted data
      return null;
    }
  }

  /**
   * Checks if token exists and is not expired
   */
  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode JWT payload (basic check - in production you might want more robust validation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Invalid token format:', error);
      this.removeToken();
      return false;
    }
  }

  /**
   * Gets token expiration time
   */
  static getTokenExpiration(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Checks if token will expire soon (within 5 minutes)
   */
  static willTokenExpireSoon(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return true;
    
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return expiration < fiveMinutesFromNow;
  }
}