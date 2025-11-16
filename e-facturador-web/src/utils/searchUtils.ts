import searchService from '../services/searchService';

/**
 * Reusable search functions for common patterns
 * These functions demonstrate how to use the searchService for specific use cases
 */

/**
 * Generic function to search entities by query string
 * 
 * @param endpoint API endpoint (e.g., '/api/producto/producto/search')
 * @param query Search query string
 * @returns Promise with search results
 */
export function searchByQuery<T>(endpoint: string, query: string): Promise<T> {
  return searchService.search<T>({
    url: endpoint,
    params: { q: query }
  });
}

/**
 * Generic function to search with pagination
 * 
 * @param endpoint API endpoint
 * @param page Page number (0-based)
 * @param size Page size
 * @param additionalParams Additional search parameters
 * @returns Promise with paginated results
 */
export function searchWithPagination<T>(
  endpoint: string,
  page: number = 0,
  size: number = 10,
  additionalParams?: { [key: string]: any }
): Promise<T> {
  return searchService.search<T>({
    url: endpoint,
    params: {
      page,
      size,
      ...additionalParams
    }
  });
}

/**
 * Generic function to search by ID
 * 
 * @param endpoint API endpoint
 * @param id Entity ID
 * @returns Promise with entity data
 */
export function searchById<T>(endpoint: string, id: string | number): Promise<T> {
  return searchService.search<T>({
    url: `${endpoint}/${id}`
  });
}

/**
 * Generic function to get all entities from an endpoint
 * 
 * @param endpoint API endpoint
 * @returns Promise with all entities
 */
export function getAll<T>(endpoint: string): Promise<T> {
  return searchService.search<T>({
    url: `${endpoint}/all`
  });
}

/**
 * Generic function to search with filters
 * 
 * @param endpoint API endpoint
 * @param filters Object with filter parameters
 * @returns Promise with filtered results
 */
export function searchWithFilters<T>(
  endpoint: string,
  filters: { [key: string]: any }
): Promise<T> {
  return searchService.search<T>({
    url: endpoint,
    params: filters
  });
}

/**
 * Generic function to search by category or parent entity
 * 
 * @param endpoint API endpoint
 * @param parentField Parent field name (e.g., 'categoria', 'empresa')
 * @param parentId Parent entity ID
 * @returns Promise with results
 */
export function searchByParent<T>(
  endpoint: string,
  parentField: string,
  parentId: string | number
): Promise<T> {
  return searchService.search<T>({
    url: `${endpoint}/${parentField}/${parentId}`
  });
}

/**
 * Create a debounced search function to avoid excessive API calls
 * Useful for search-as-you-type functionality
 * 
 * @param searchFn Search function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced search function
 */
export function createDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 300
): (query: string) => Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  return (query: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        searchFn(query)
          .then(resolve)
          .catch(reject);
      }, delay);
    });
  };
}