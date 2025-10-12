export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    empresaId: number;
    sucursalId?: number;
}

export interface AuthUser {
    username: string;
    empresaId: number;
    sucursalId?: number;
    isAuthenticated: boolean;
}

export interface AuthContextType {
    user: AuthUser | null;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}
