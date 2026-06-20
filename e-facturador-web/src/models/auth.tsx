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
    // Flujo soporte
    esSoporte?: boolean;
    requiresEmpresaSoporteSelection?: boolean;
    empresasSoporteDisponibles?: EmpresaSoporteOpcion[];
}

export interface SelectSucursalRequest {
    preAuthToken: string;
    sucursalId: number;
}

export interface SelectEmpresaSoporteRequest {
    preAuthToken: string;
    empresaIdDestino: number;
}

/** Empresa disponible para seleccionar en el login de usuario soporte. */
export interface EmpresaSoporteOpcion {
    empresaId: number;
    empresaNombre: string;
    /** ISO string de la fecha de expiración del grant de soporte. */
    fechaExpiracion: string;
}

export interface AuthUser {
    username: string;
    empresaId: number;
    sucursalId?: number;
    sucursalNombre?: string;
    empresaNombre?: string;
    isAuthenticated: boolean;
    /** true cuando la sesión fue emitida en modo soporte (solo lectura). */
    esSoporte?: boolean;
}

export interface PendingAuth {
    preAuthToken: string;
    sucursales: SucursalOpcion[];
    username: string;
}

/** Estado de pre-autenticación para el selector de empresa soporte. */
export interface PendingSoporteAuth {
    preAuthToken: string;
    empresas: EmpresaSoporteOpcion[];
    username: string;
}

export interface AuthContextType {
    user: AuthUser | null;
    pendingAuth: PendingAuth | null;
    pendingSoporteAuth: PendingSoporteAuth | null;
    login: (credentials: LoginRequest) => Promise<void>;
    selectSucursal: (sucursalId: number) => Promise<void>;
    selectEmpresaSoporte: (empresaId: number) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}
