import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginView from "./components/auth/LoginView";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import EmpresaView from "./components/seguridad/EmpresaView";
import UsuarioView from "./components/seguridad/UsuarioView";
import HomeView from "./HomeView";

// Create Material-UI theme
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
    },
});

// Main app routing component
const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={user?.isAuthenticated ? <Navigate to="/" replace /> : <LoginView />} />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <HomeView />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/empresa"
                element={
                    <ProtectedRoute>
                        <EmpresaView />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/usuarios"
                element={
                    <ProtectedRoute>
                        <UsuarioView />
                    </ProtectedRoute>
                }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

// Main App component
const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
