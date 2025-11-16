/**
 * Type definitions for common search patterns
 * These interfaces help with type safety when using the search service
 */

// Base interfaces for search responses
export interface SearchResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Common search parameter patterns
export interface BasicSearchParams {
  q?: string; // Query string
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface DateRangeParams {
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface StatusParams {
  estado?: 'activo' | 'inactivo' | 'pendiente' | 'procesado';
  status?: string;
}

// Specific search parameter interfaces for different entities
export interface ProductoSearchParams extends BasicSearchParams, PaginationParams, StatusParams {
  categoria?: string;
  categoria_id?: number;
  precio_min?: number;
  precio_max?: number;
  suplidor?: string;
  suplidor_id?: number;
  codigo?: string;
  disponible?: boolean;
}

export interface UsuarioSearchParams extends BasicSearchParams, PaginationParams, StatusParams {
  role?: string;
  empresa_id?: number;
  activo?: boolean;
}

export interface FacturaSearchParams extends BasicSearchParams, PaginationParams, DateRangeParams {
  cliente_id?: number;
  tipo_comprobante?: string;
  monto_min?: number;
  monto_max?: number;
  estado?: 'borrador' | 'emitida' | 'pagada' | 'anulada';
}

export interface CategoriaSearchParams extends BasicSearchParams, PaginationParams, StatusParams {
  parent_id?: number;
  nivel?: number;
}

// Search result interfaces
export interface SearchResult<T> {
  results: T[];
  total: number;
  page?: number;
  size?: number;
}

// Search function types for reusable functions
export type SearchFunction<T, P = any> = (params?: P) => Promise<T>;

export type PaginatedSearchFunction<T, P = any> = (params?: P & PaginationParams) => Promise<PaginatedResponse<T>>;

// Search service method types
export interface SearchMethodMap {
  search: <T>(url: string, params?: any) => Promise<T>;
  searchWithPagination: <T>(url: string, params?: PaginationParams & any) => Promise<PaginatedResponse<T>>;
  searchById: <T>(url: string, id: string | number) => Promise<T>;
  searchByParent: <T>(url: string, parentField: string, parentId: string | number) => Promise<T>;
}

// Advanced search configuration
export interface SearchConfig {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  cacheResults?: boolean;
  cacheDurationMs?: number;
}

// Error handling types
export interface SearchError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Hook types for React integration (if you want to create custom hooks later)
export interface UseSearchOptions<T, P> extends SearchConfig {
  initialParams?: P;
  onSuccess?: (data: T) => void;
  onError?: (error: SearchError) => void;
  enabled?: boolean;
}

export interface UseSearchResult<T> {
  data: T | undefined;
  loading: boolean;
  error: SearchError | null;
  refetch: () => void;
  reset: () => void;
}

// Common filter types
export interface FilterOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterGroup {
  name: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'number' | 'text' | 'boolean';
  options?: FilterOption[];
  placeholder?: string;
  required?: boolean;
}