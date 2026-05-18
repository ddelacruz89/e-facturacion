export interface LoginRequest {
    username: string;
    password: string;
}

export interface SucursalOpcion {
    sucursalId: number;
    sucursalNombre: string;
    empresaId: number;
    empresaNombre: string;
}

export interface LoginResponse {
    token?: string;
    username: string;
    empresaId?: number;
    sucursalId?: number;
    sucursalNombre?: string;
    empresaNombre?: string;
    // Flujo multi-sucursal
    requiresSucursalSelection?: boolean;
    preAuthToken?: string;
    sucursalesDisponibles?: SucursalOpcion[];
}

export interface SelectSucursalRequest {
    preAuthToken: string;
    sucursalId: number;
}

export interface AuthUser {
    username: string;
    empresaId: number;
    sucursalId?: number;
    sucursalNombre?: string;
    empresaNombre?: string;
    isAuthenticated: boolean;
}

export interface PendingAuth {
    preAuthToken: string;
    sucursales: SucursalOpcion[];
    username: string;
}

export interface AuthContextType {
    user: AuthUser | null;
    pendingAuth: PendingAuth | null;
    login: (credentials: LoginRequest) => Promise<void>;
    selectSucursal: (sucursalId: number) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}
