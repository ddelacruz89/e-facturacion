import apiClient from './apiClient';

export interface SearchParams {
  [key: string]: string | number | boolean | undefined | null;
}

export interface SearchOptions {
  /**
   * Base API endpoint URL
   */
  url: string;
  /**
   * Query parameters to append to the URL
   */
  params?: SearchParams;
  /**
   * Additional headers for the request
   */
  headers?: { [key: string]: string };
  /**
   * Timeout for the request in milliseconds
   */
  timeout?: number;
}

export interface SearchResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Generic search service for making GET requests with parameters
 * 
 * @example
 * // Simple search with query parameter
 * const productos = await searchService.search<MgProducto[]>({
 *   url: '/api/producto/producto/search',
 *   params: { q: 'laptop' }
 * });
 * 
 * @example
 * // Search with multiple parameters
 * const users = await searchService.search<User[]>({
 *   url: '/api/users',
 *   params: {
 *     page: 1,
 *     size: 10,
 *     status: 'active',
 *     role: 'admin'
 *   }
 * });
 * 
 * @example
 * // Search with custom headers
 * const data = await searchService.search<any>({
 *   url: '/api/protected/data',
 *   params: { filter: 'important' },
 *   headers: { 'X-Custom-Header': 'value' }
 * });
 */
export class SearchService {
  /**
   * Performs a GET request with the provided options
   * 
   * @param options Search options including URL and parameters
   * @returns Promise with the response data
   */
  async search<T>(options: SearchOptions): Promise<T> {
    const { url, params, headers, timeout } = options;
    
    try {
      const response = await apiClient.get(url, {
        params: this.cleanParams(params),
        headers,
        timeout
      });
      
      return response.data;
    } catch (error) {
      console.error('[SearchService] Error:', error);
      throw error;
    }
  }

  /**
   * Performs a GET request and returns the full response including status
   * 
   * @param options Search options including URL and parameters
   * @returns Promise with the full response
   */
  async searchWithResponse<T>(options: SearchOptions): Promise<SearchResponse<T>> {
    const { url, params, headers, timeout } = options;
    
    try {
      const response = await apiClient.get(url, {
        params: this.cleanParams(params),
        headers,
        timeout
      });
      
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      console.error('[SearchService] Error:', error);
      throw error;
    }
  }

  /**
   * Creates a search function for a specific endpoint
   * Useful for creating reusable search functions for specific entities
   * 
   * @param baseUrl Base URL for the endpoint
   * @param defaultParams Default parameters to include in every request
   * @returns Function that accepts additional parameters and returns search results
   * 
   * @example
   * // Create a reusable function for searching productos
   * const searchProductos = searchService.createSearchFunction<MgProducto[]>(
   *   '/api/producto/producto/search'
   * );
   * 
   * // Use the function
   * const products = await searchProductos({ q: 'laptop', categoria: 'electronics' });
   */
  createSearchFunction<T>(
    baseUrl: string, 
    defaultParams?: SearchParams
  ): (params?: SearchParams) => Promise<T> {
    return (params?: SearchParams) => {
      return this.search<T>({
        url: baseUrl,
        params: { ...defaultParams, ...params }
      });
    };
  }

  /**
   * Clean parameters by removing undefined, null, and empty string values
   * 
   * @param params Parameters to clean
   * @returns Cleaned parameters object
   */
  private cleanParams(params?: SearchParams): SearchParams | undefined {
    if (!params) return undefined;
    
    const cleaned: SearchParams = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });
    
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
}

// Export a singleton instance
export const searchService = new SearchService();

// Export default instance
export default searchService;