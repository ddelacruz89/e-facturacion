import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginView from "./components/auth/LoginView";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Import debug utility
import "./utils/debugAuth";

// Lazy imports
const HomeView = lazy(() => import("./HomeView"));
const EmpresaView = lazy(() => import("./components/seguridad/EmpresaView"));
const UsuarioView = lazy(() => import("./components/seguridad/UsuarioView"));
const TipoFacturaView = lazy(() => import("./components/facturacion/TipoFacturaView"));
const TipoItbisView = lazy(() => import("./components/facturacion/TipoItbisView"));
const FacturacionView = lazy(() => import("./components/facturacion/FacturacionView"));
const TipoComprobanteView = lazy(() => import("./components/facturacion/TipoComprobanteView"));
const ProductoView = lazy(() => import("./components/producto/ProductoView"));
const CategoriaView = lazy(() => import("./components/producto/CategoriaView"));

// Routes component that uses authentication context
const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
                {/* Login route - redirect to home if already authenticated */}
                <Route path="/login" element={user?.isAuthenticated ? <Navigate to="/" replace /> : <LoginView />} />

                {/* Protected routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomeView />
                        </ProtectedRoute>
                    }>
                    <Route path="empresa" element={<EmpresaView />} />
                    <Route path="usuario" element={<UsuarioView />} />
                    <Route path="tipo/factura" element={<TipoFacturaView />} />
                    <Route path="tipo/itbis" element={<TipoItbisView />} />
                    <Route path="tipo/comprobante" element={<TipoComprobanteView />} />
                    <Route path="facturacion" element={<FacturacionView />} />
                    <Route path="producto" element={<ProductoView />} />
                    <Route path="categoria" element={<CategoriaView />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

function App() {
    const theme = createTheme({
        components: {
            MuiInputLabel: {
                styleOverrides: {
                    shrink: {
                        fontSize: "16px",
                        fontWeight: "bold", // tamaño cuando sube (shrink)
                    },
                },
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
