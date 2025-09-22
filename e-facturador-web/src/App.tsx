import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { createTheme, ThemeProvider } from '@mui/material';

// Lazy imports
const HomeView = lazy(() => import("./HomeView"));
const EmpresaView = lazy(() => import("./components/seguridad/EmpresaView"));
const UsuarioView = lazy(() => import("./components/seguridad/UsuarioView"));
const TipoFacturaView = lazy(() => import("./components/facturacion/TipoFacturaView"));
const TipoItbisView = lazy(() => import("./components/facturacion/TipoItbisView"));
const FacturacionView = lazy(() => import("./components/facturacion/FacturacionView"));
const TipoComprobanteView = lazy(() => import("./components/facturacion/TipoComprobanteView"));

function App() {
  const theme = createTheme({
    components: {
      MuiInputLabel: {
        styleOverrides: {
          shrink: {
            fontSize: "16px",
            fontWeight: "bold"   // tamaño cuando sube (shrink)
          },
        },
      }
    },
  });
  return (

    <ThemeProvider theme={theme}>
      <Router>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route path="/" element={<HomeView />}>
              <Route path="empresa" element={<EmpresaView />} />
              <Route path="usuario" element={<UsuarioView />} />
              <Route path="tipo/factura" element={<TipoFacturaView />} />
              <Route path="tipo/itbis" element={<TipoItbisView />} />
              <Route path="tipo/comprobante" element={<TipoComprobanteView />} />
              <Route path="facturacion" element={<FacturacionView />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>

  );
}

export default App;