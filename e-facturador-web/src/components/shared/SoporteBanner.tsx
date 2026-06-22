import React from "react";
import { Alert, Box } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Banner visible durante toda la sesión cuando el usuario inició sesión en
 * modo soporte (esSoporte=true en el JWT).
 *
 * Montar en el layout principal, justo debajo del AppBar.
 *
 * Ejemplo:
 * ```tsx
 * // En tu layout / AppShell:
 * <SoporteBanner />
 * <main>{children}</main>
 * ```
 */
const SoporteBanner: React.FC = () => {
    const { user } = useAuth();

    if (!user?.esSoporte) return null;

    return (
        <Box sx={{ position: "sticky", top: 0, zIndex: (theme) => theme.zIndex.appBar - 1 }}>
            <Alert
                severity="warning"
                icon={false}
                sx={{
                    borderRadius: 0,
                    py: 0.5,
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    letterSpacing: "0.03em",
                }}>
                🛠 MODO SOPORTE — Solo lectura &nbsp;|&nbsp; Empresa: <strong>{user.empresaNombre}</strong>
                &nbsp;|&nbsp; Las acciones de escritura están bloqueadas
            </Alert>
        </Box>
    );
};

export default SoporteBanner;
