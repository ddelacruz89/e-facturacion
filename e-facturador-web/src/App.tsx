import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// Lazy imports
const HomeView = lazy(() => import("./HomeView"));
const EmpresaView = lazy(() => import("./components/seguridad/EmpresaView"));
const UsuarioView = lazy(() => import("./components/seguridad/UsuarioView"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          <Route path="/" element={<HomeView />}>
            <Route path="empresa" element={<EmpresaView />} />
            <Route path="usuario" element={<UsuarioView />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;