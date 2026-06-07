import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginView from "./components/auth/LoginView";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MenuRoute from "./components/auth/MenuRoute";

// Import debug utility
import "./utils/debugAuth";
import { ToastContainer } from "react-toastify";

// Lazy imports
const HomeView = lazy(() => import("./HomeView"));
const EmpresaView = lazy(() => import("./components/seguridad/EmpresaView"));
const UsuarioView = lazy(() => import("./components/seguridad/UsuarioView"));
const RolView = lazy(() => import("./components/seguridad/RolView"));
const AprobacionConfigView = lazy(() => import("./components/seguridad/AprobacionConfigView"));
const AprobacionBandejaView = lazy(() => import("./components/seguridad/AprobacionBandejaView"));
const TipoFacturaView = lazy(() => import("./components/facturacion/TipoFacturaView"));
const TipoItbisView = lazy(() => import("./components/facturacion/TipoItbisView"));
const RetencionView = lazy(() => import("./components/facturacion/TipoRetencionView"));
const FacturacionView = lazy(() => import("./components/facturacion/FacturacionView"));
const TipoComprobanteView = lazy(() => import("./components/facturacion/TipoComprobanteView"));
const ProductoView = lazy(() => import("./components/producto/ProductoView"));
const CategoriaView = lazy(() => import("./components/producto/CategoriaView"));
const UnidadView = lazy(() => import("./components/producto/UnidadView"));
const PaqueteView = lazy(() => import("./components/producto/PaqueteView"));
const SuplidorView = lazy(() => import("./components/inventario/SuplidorView"));
const CotizacionView = lazy(() => import("./components/inventario/CotizacionView"));
const OrdenCompraView = lazy(() => import("./components/inventario/OrdenCompraView"));
const OrdenEntradaView = lazy(() => import("./components/inventario/OrdenEntradaView"));
const TransferenciaView = lazy(() => import("./components/inventario/TransferenciaView"));
const LoteView = lazy(() => import("./components/inventario/LoteView"));
const MovimientoView = lazy(() => import("./components/inventario/MovimientoView"));
const ClientesView = lazy(() => import("./components/Cliente/ClientesView"));
const AjusteInventarioView = lazy(() => import("./components/inventario/AjusteInventarioView"));
const AlmacenView = lazy(() => import("./components/inventario/AlmacenView"));
const StockArbolView = lazy(() => import("./components/inventario/StockArbolView"));
const StockCriticoView = lazy(() => import("./components/inventario/StockCriticoView"));
const FacturaSuplidorView = lazy(() => import("./components/facturacion/FacturaSuplidorView"));
const FacturaSuplidorPagosView = lazy(() => import("./components/facturacion/FacturaSuplidorPagosView"));
const FormaPagoSuplidorView = lazy(() => import("./components/facturacion/FormaPagoSuplidorView"));
const MfItbisView = lazy(() => import("./components/facturacion/MfItbisView"));
const NotificacionesView = lazy(() => import("./components/notificaciones/NotificacionesView"));
const RequisicionView = lazy(() => import("./components/inventario/RequisicionView"));
const ReportesInventarioView = lazy(() => import("./components/inventario/ReportesInventarioView"));
const DashboardView = lazy(() => import("./components/shared/DashboardView"));
const DeTipoVehiculoView = lazy(() => import("./components/despacho/DeTipoVehiculoView"));
const DeVehiculoView = lazy(() => import("./components/despacho/DeVehiculoView"));
const DeOrdenDespachoView = lazy(() => import("./components/despacho/DeOrdenDespachoView"));
const DeRutaEntregaView = lazy(() => import("./components/despacho/DeRutaEntregaView"));
const MisEntregasView = lazy(() => import("./components/despacho/MisEntregasView"));
const ReciboEntregaConfigView = lazy(() => import("./components/despacho/ReciboEntregaConfigView"));
const DePrecioEnvioView = lazy(() => import("./components/despacho/DePrecioEnvioView"));
const NotificacionTipoConfigView = lazy(() => import("./components/seguridad/NotificacionTipoConfigView"));

// Routes component that uses authentication context
const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ToastContainer />
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
                    <Route index element={<DashboardView />} />
                    <Route path="empresa" element={<EmpresaView />} />
                    <Route path="usuario" element={<UsuarioView />} />
                    <Route path="roles" element={<RolView />} />
                    <Route path="tipo/factura" element={<TipoFacturaView />} />
                    <Route path="tipo/itbis" element={<TipoItbisView />} />
                    <Route path="tipo/retencion" element={<RetencionView />} />
                    <Route path="tipo/comprobante" element={<TipoComprobanteView />} />
                    <Route path="facturacion" element={<FacturacionView />} />
                    <Route path="producto" element={<ProductoView />} />
                    <Route path="producto/categoria" element={<CategoriaView />} />
                    <Route path="producto/unidad" element={<UnidadView />} />
                    <Route path="paquete" element={<PaqueteView />} />
                    <Route path="suplidores" element={<SuplidorView />} />
                    <Route path="/inventario/cotizacion" element={<CotizacionView />} />
                    <Route path="/inventario/orden-compra" element={<OrdenCompraView />} />
                    <Route path="/inventario/orden-entrada" element={<OrdenEntradaView />} />
                    <Route path="/inventario/transferencias" element={<TransferenciaView />} />
                    <Route path="/inventario/lotes" element={<LoteView />} />
                    <Route path="/inventario/movimientos" element={<MovimientoView />} />
                    <Route path="clientes" element={<ClientesView />} />
                    <Route path="/inventario/ajuste-inventario" element={<AjusteInventarioView />} />
                    <Route path="almacenes" element={<AlmacenView />} />
                    <Route path="stock-arbol" element={<StockArbolView />} />
                    <Route path="stock-critico" element={<StockCriticoView />} />
                    <Route path="factura-suplidor" element={<FacturaSuplidorView />} />
                    <Route path="pagos-suplidor" element={<FacturaSuplidorPagosView />} />
                    <Route path="formas-pago-suplidor" element={<FormaPagoSuplidorView />} />
                    <Route path="mf-itbis" element={<MfItbisView />} />
                    <Route path="alertas" element={<NotificacionesView />} />
                    <Route path="inventario/requisicion" element={<RequisicionView />} />
                    <Route path="inventario/reportes" element={<ReportesInventarioView />} />
                    <Route path="aprobaciones-config" element={<AprobacionConfigView />} />
                    <Route path="aprobaciones-bandeja" element={<AprobacionBandejaView />} />
                    <Route path="despacho/tipo-vehiculo" element={<MenuRoute menuUrl="/despacho/tipo-vehiculo"><DeTipoVehiculoView /></MenuRoute>} />
                    <Route path="despacho/vehiculos" element={<MenuRoute menuUrl="/despacho/vehiculos"><DeVehiculoView /></MenuRoute>} />
                    <Route path="despacho/ordenes" element={<MenuRoute menuUrl="/despacho/ordenes"><DeOrdenDespachoView /></MenuRoute>} />
                    <Route path="despacho/rutas" element={<MenuRoute menuUrl="/despacho/rutas"><DeRutaEntregaView /></MenuRoute>} />
                    <Route path="despacho/mis-entregas" element={<MenuRoute menuUrl="/despacho/mis-entregas"><MisEntregasView /></MenuRoute>} />
                    <Route path="despacho/config/recibo" element={<MenuRoute menuUrl="/despacho/config/recibo"><ReciboEntregaConfigView /></MenuRoute>} />
                    <Route path="despacho/precios-envio" element={<MenuRoute menuUrl="/despacho/precios-envio"><DePrecioEnvioView /></MenuRoute>} />
                    <Route path="seguridad/config-avisos" element={<NotificacionTipoConfigView />} />
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
    })

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
