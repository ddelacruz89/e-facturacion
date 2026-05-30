import React from "react";
import { Navigate } from "react-router-dom";
import { useSharedModulos } from "../../hooks/useSharedModulos";

interface MenuRouteProps {
    menuUrl: string;
    children: React.ReactNode;
}

const normalize = (u: string) => u.replace(/^\//, "");

/**
 * Guarda de ruta basado en permisos de menú.
 * Usa la lista de módulos permitidos (GET /api/seguridad/modulo/permitidos)
 * para verificar que el usuario tenga acceso al menuUrl dado.
 * Si no tiene acceso, redirige a "/".
 */
const MenuRoute: React.FC<MenuRouteProps> = ({ menuUrl, children }) => {
    const { data: modulos, loading } = useSharedModulos();

    if (loading) return null;

    const allUrls = modulos.flatMap((m) => m.menus.map((menu) => menu.url));
    const hasAccess = allUrls.some((u) => normalize(u) === normalize(menuUrl));

    if (!hasAccess) return <Navigate to="/" replace />;

    return <>{children}</>;
};

export default MenuRoute;
