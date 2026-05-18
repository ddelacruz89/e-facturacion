import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthContextType, AuthUser, LoginRequest, PendingAuth } from "../models/auth";
import { AuthService } from "../services/authService";
import { TokenService } from "../services/tokenService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);
                if (TokenService.isTokenValid()) {
                    const userData = TokenService.getUser();
                    if (userData) {
                        setUser(userData);
                        const isValidSession = await AuthService.validateSession();
                        if (!isValidSession) {
                            setUser(null);
                            setError("Sesión expirada. Por favor, inicie sesión nuevamente.");
                        } else {
                            // Recargar usuario por si se actualizaron los nombres
                            const refreshed = TokenService.getUser();
                            if (refreshed) setUser(refreshed);
                        }
                    }
                } else {
                    TokenService.removeToken();
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                setError("Error al inicializar la autenticación");
                TokenService.removeToken();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;
        const checkTokenExpiration = async () => {
            if (TokenService.willTokenExpireSoon()) {
                const newToken = await AuthService.refreshToken();
                if (!newToken) {
                    setError("Sesión expirada. Por favor, inicie sesión nuevamente.");
                    setUser(null);
                }
            }
        };
        const interval = setInterval(checkTokenExpiration, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            setPendingAuth(null);

            const response = await AuthService.login(credentials);

            if (response.requiresSucursalSelection) {
                // Guardar estado de pre-autenticación: el LoginView mostrará el selector
                setPendingAuth({
                    preAuthToken: response.preAuthToken!,
                    sucursales: response.sucursalesDisponibles!,
                    username: response.username,
                });
            } else {
                const userData: AuthUser = {
                    username: response.username,
                    empresaId: response.empresaId!,
                    sucursalId: response.sucursalId,
                    sucursalNombre: response.sucursalNombre,
                    empresaNombre: response.empresaNombre,
                    isAuthenticated: true,
                };
                setUser(userData);
            }
        } catch (error: any) {
            const errorMessage = error.message || "Error durante el login";
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const selectSucursal = async (sucursalId: number): Promise<void> => {
        if (!pendingAuth) throw new Error("No hay sesión pendiente de selección de sucursal");

        try {
            setIsLoading(true);
            setError(null);

            const response = await AuthService.selectSucursal(pendingAuth.preAuthToken, sucursalId);

            const userData: AuthUser = {
                username: response.username,
                empresaId: response.empresaId!,
                sucursalId: response.sucursalId,
                sucursalNombre: response.sucursalNombre,
                empresaNombre: response.empresaNombre,
                isAuthenticated: true,
            };

            setPendingAuth(null);
            setUser(userData);
        } catch (error: any) {
            const errorMessage = error.message || "Error al seleccionar sucursal";
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        try {
            AuthService.logout();
            setUser(null);
            setPendingAuth(null);
            setError(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const value: AuthContextType = {
        user,
        pendingAuth,
        login,
        selectSucursal,
        logout,
        isLoading,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
        const { user, isLoading } = useAuth();
        if (isLoading) return <div>Cargando...</div>;
        if (!user?.isAuthenticated) return <div>No autorizado. Redirigiendo al login...</div>;
        return <Component {...props} />;
    };
};
