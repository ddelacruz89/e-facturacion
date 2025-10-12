import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthContextType, AuthUser, LoginRequest } from "../models/auth";
import { AuthService } from "../services/authService";
import { TokenService } from "../services/tokenService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize authentication state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);

                // Check if user has valid token
                if (TokenService.isTokenValid()) {
                    const userData = TokenService.getUser();
                    if (userData) {
                        setUser(userData);

                        // Optional: Validate session with backend
                        const isValidSession = await AuthService.validateSession();
                        if (!isValidSession) {
                            setUser(null);
                            setError("Sesión expirada. Por favor, inicie sesión nuevamente.");
                        }
                    }
                } else {
                    // Clean up invalid tokens
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

    // Auto token refresh
    useEffect(() => {
        if (!user) return;

        const checkTokenExpiration = async () => {
            if (TokenService.willTokenExpireSoon()) {
                console.log("Token will expire soon, attempting refresh...");
                const newToken = await AuthService.refreshToken();

                if (!newToken) {
                    setError("Sesión expirada. Por favor, inicie sesión nuevamente.");
                    setUser(null);
                }
            }
        };

        // Check token expiration every minute
        const interval = setInterval(checkTokenExpiration, 60000);

        return () => clearInterval(interval);
    }, [user]);

    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await AuthService.login(credentials);

            const userData: AuthUser = {
                username: response.username,
                empresaId: response.empresaId,
                sucursalId: response.sucursalId,
                isAuthenticated: true,
            };

            setUser(userData);
        } catch (error: any) {
            const errorMessage = error.message || "Error durante el login";
            setError(errorMessage);
            throw error; // Re-throw to handle in component
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        try {
            AuthService.logout();
            setUser(null);
            setError(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isLoading,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
        const { user, isLoading } = useAuth();

        if (isLoading) {
            return <div>Cargando...</div>; // You can replace with a loading component
        }

        if (!user?.isAuthenticated) {
            return <div>No autorizado. Redirigiendo al login...</div>;
        }

        return <Component {...props} />;
    };
};
