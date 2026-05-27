import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import {
    Alert, Badge, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, IconButton, InputAdornment,
    List, ListItem, ListItemText, Menu, MenuItem, Popover, TextField, Typography,
} from "@mui/material";
import { AccountCircle, ExitToApp, LockReset, NotificationsOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import "./menu.css";
import { useEffect, useRef, useState } from "react";
import logo from "./assets/logo-braintech.png";
import { AuthService } from "./services/authService";
import { useSharedModulos } from "./hooks/useSharedModulos";
import { ModuloDto } from "./models/seguridad";
import { SgNotificacionDTO, getNotificaciones, getContadorNoVistas } from "./apis/SgNotificacionController";
import { TokenService } from "./services/tokenService";

const tipoColor: Record<string, "error" | "warning" | "info" | "default"> = {
    VENCIMIENTO: "error",
    STOCK_BAJO: "warning",
    APROBACION_PENDIENTE: "info",
    LIMITE_PRODUCTO: "warning",
};

const HomeView = () => {
    const [mostrarPanel, setMostrarPanel] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [moduloActivo, setModuloActivo] = useState<ModuloDto>({ id: "", menus: [], modulo: "" });

    // ── alertas ────────────────────────────────────────────────────────────────
    const [noVistas, setNoVistas] = useState(0);
    const [alertasRecientes, setAlertasRecientes] = useState<SgNotificacionDTO[]>([]);
    const [cargandoAlertas, setCargandoAlertas] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const popoverAbierto = Boolean(anchorEl);
    const esRef = useRef<EventSource | null>(null);

    const refrescarContador = () => {
        getContadorNoVistas()
            .then(setNoVistas)
            .catch(() => {});
    };

    useEffect(() => {
        if (!user?.isAuthenticated) return;

        // Carga inicial del contador
        refrescarContador();

        // Abre la conexión SSE — el servidor empuja cuando hay notificaciones nuevas
        const token = TokenService.getToken();
        const url = `/api/v1/notificaciones/stream?token=${encodeURIComponent(token ?? "")}`;
        const es = new EventSource(url);
        esRef.current = es;

        es.addEventListener("nueva-alerta", () => {
            refrescarContador();
        });

        es.onerror = () => {
            // EventSource reconecta automáticamente; no hace falta hacer nada
        };

        // Fallback: refresca el contador cada 5 minutos por si el SSE se pierde
        const fallback = setInterval(refrescarContador, 5 * 60_000);

        return () => {
            es.close();
            esRef.current = null;
            clearInterval(fallback);
        };
    }, [user?.isAuthenticated]);

    const handleBellClick = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
        setCargandoAlertas(true);
        getNotificaciones()
            .then((data) => setAlertasRecientes(data.slice(0, 5)))
            .catch(() => setAlertasRecientes([]))
            .finally(() => setCargandoAlertas(false));
    };

    const handleCerrarPopover = () => setAnchorEl(null);

    const handleVerMas = () => {
        handleCerrarPopover();
        navigate("/alertas");
    };

    // ── layout ─────────────────────────────────────────────────────────────────
    const { data: modulos } = useSharedModulos();

    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);

    // ── cambiar contraseña ─────────────────────────────────────────────────────
    const [cambioPasswordOpen, setCambioPasswordOpen] = useState(false);
    const [cpActual, setCpActual] = useState("");
    const [cpNueva, setCpNueva] = useState("");
    const [cpConfirm, setCpConfirm] = useState("");
    const [cpError, setCpError] = useState<string | null>(null);
    const [cpExito, setCpExito] = useState(false);
    const [cpCargando, setCpCargando] = useState(false);
    const [mostrarActual, setMostrarActual] = useState(false);
    const [mostrarNueva, setMostrarNueva] = useState(false);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const handleAbrirCambioPassword = () => {
        setUserMenuAnchor(null);
        setCpActual(""); setCpNueva(""); setCpConfirm("");
        setCpError(null); setCpExito(false);
        setCambioPasswordOpen(true);
    };

    const handleCerrarCambioPassword = () => {
        if (cpCargando) return;
        setCambioPasswordOpen(false);
    };

    const handleSubmitCambioPassword = async () => {
        setCpError(null);
        if (!cpActual || !cpNueva || !cpConfirm) {
            setCpError("Todos los campos son obligatorios.");
            return;
        }
        if (cpNueva !== cpConfirm) {
            setCpError("La nueva contraseña y su confirmación no coinciden.");
            return;
        }
        if (cpNueva.length < 6) {
            setCpError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }
        setCpCargando(true);
        try {
            await AuthService.cambiarPassword(cpActual, cpNueva);
            setCpExito(true);
        } catch (err: any) {
            const msg = err?.response?.data ?? err?.message ?? "Error al cambiar la contraseña.";
            setCpError(typeof msg === "string" ? msg : "Error al cambiar la contraseña.");
        } finally {
            setCpCargando(false);
        }
    };

    const handleLogout = () => {
        setUserMenuAnchor(null);
        logout();
        navigate("/login");
    };

    return (
        <div className="container-main">
            <div className="top">
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#f5f5f5",
                        borderBottom: "1px solid #ddd",
                    }}>
                    <Typography variant="body2" color="text.secondary">
                        Bienvenido, <strong>{user?.username}</strong>
                        {" | "}<strong>{user?.empresaNombre ?? `Empresa #${user?.empresaId}`}</strong>
                        {(user?.sucursalNombre ?? user?.sucursalId) && (
                            <> {" — "}<strong>{user?.sucursalNombre ?? `Sucursal #${user?.sucursalId}`}</strong></>
                        )}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                        {/* Campana */}
                        <IconButton
                            size="small"
                            onClick={handleBellClick}
                            color={noVistas > 0 ? "warning" : "default"}
                        >
                            <Badge badgeContent={noVistas > 0 ? noVistas : undefined} color="error" max={99}>
                                <NotificationsOutlined />
                            </Badge>
                        </IconButton>

                        {/* Popover de alertas recientes */}
                        <Popover
                            open={popoverAbierto}
                            anchorEl={anchorEl}
                            onClose={handleCerrarPopover}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            PaperProps={{ sx: { width: 360, maxHeight: 480 } }}
                        >
                            <Box px={2} pt={1.5} pb={1} display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Alertas de inventario
                                </Typography>
                                {noVistas > 0 && (
                                    <Chip label={`${noVistas} sin ver`} color="error" size="small" />
                                )}
                            </Box>
                            <Divider />

                            {cargandoAlertas ? (
                                <Box display="flex" justifyContent="center" py={3}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : alertasRecientes.length === 0 ? (
                                <Box px={2} py={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay alertas activas.
                                    </Typography>
                                </Box>
                            ) : (
                                <List dense disablePadding>
                                    {alertasRecientes.map((a, idx) => (
                                        <Box key={a.id}>
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    backgroundColor: a.visto ? "inherit" : "#fff8e1",
                                                    px: 2,
                                                    py: 1,
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Chip
                                                                label={a.tipo.replace(/_/g, " ")}
                                                                color={tipoColor[a.tipo] ?? "default"}
                                                                size="small"
                                                            />
                                                            <Typography variant="body2" noWrap>
                                                                {a.titulo}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={a.descripcion ?? undefined}
                                                />
                                            </ListItem>
                                            {idx < alertasRecientes.length - 1 && <Divider component="li" />}
                                        </Box>
                                    ))}
                                </List>
                            )}

                            <Divider />
                            <Box px={2} py={1}>
                                <Button
                                    fullWidth
                                    size="small"
                                    variant="text"
                                    onClick={handleVerMas}
                                >
                                    Ver todas las alertas
                                </Button>
                            </Box>
                        </Popover>

                        <IconButton
                            size="small"
                            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            anchorEl={userMenuAnchor}
                            open={Boolean(userMenuAnchor)}
                            onClose={() => setUserMenuAnchor(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            <MenuItem onClick={handleAbrirCambioPassword} sx={{ gap: 1 }}>
                                <LockReset fontSize="small" />
                                Cambiar Contraseña
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: "error.main", gap: 1 }}>
                                <ExitToApp fontSize="small" />
                                Cerrar Sesión
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </div>
            <div className="left">
                <div style={{ cursor: "pointer", fontWeight: "bold" }}>
                    <div className="short-menu">
                        <ul>
                            {modulos.map((modulo) => (
                                <li
                                    key={modulo.id}
                                    className="seg"
                                    title={modulo.modulo}
                                    data-active={moduloActivo.id === modulo.id}
                                    onClick={() => {
                                        setMostrarPanel(true);
                                        setModuloActivo(modulo);
                                    }}>
                                    {modulo.modulo.substring(0, 3).toUpperCase()}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {mostrarPanel && (
                    <div className="menu-panel">
                        <div className="tittle-menu">
                            {moduloActivo.modulo}{" "}
                            <div className="exit-menu" onClick={() => setMostrarPanel(false)}>
                                X
                            </div>
                        </div>
                        <ul>
                            {moduloActivo.menus.map((menu) => (
                                <li key={menu.id} className="menu-item">
                                    <NavLink
                                        to={menu.url}
                                        onClick={() => setMostrarPanel(false)}
                                        style={({ isActive }) => ({
                                            display: "block",
                                            padding: "inherit",
                                            color: isActive ? "#1976d2" : "inherit",
                                            fontWeight: isActive ? 700 : "inherit",
                                            textDecoration: "none",
                                            width: "100%",
                                        })}
                                    >
                                        {menu.menu}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="center" style={{ flex: 1, padding: "1rem" }}>
                <Outlet />
            </div>
            <div className="foot">
                <img src={logo} alt="Braintech" style={{ height: "40px" }} />
            </div>

            {/* ── Modal cambiar contraseña ─────────────────────────────────── */}
            <Dialog open={cambioPasswordOpen} onClose={handleCerrarCambioPassword} maxWidth="xs" fullWidth>
                <DialogTitle>Cambiar Contraseña</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                    {cpExito ? (
                        <Alert severity="success">Contraseña actualizada correctamente.</Alert>
                    ) : (
                        <>
                            {cpError && <Alert severity="error">{cpError}</Alert>}
                            <TextField
                                label="Contraseña actual"
                                type={mostrarActual ? "text" : "password"}
                                value={cpActual}
                                onChange={(e) => setCpActual(e.target.value)}
                                size="small"
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setMostrarActual((v) => !v)}>
                                                {mostrarActual ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                label="Nueva contraseña"
                                type={mostrarNueva ? "text" : "password"}
                                value={cpNueva}
                                onChange={(e) => setCpNueva(e.target.value)}
                                size="small"
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setMostrarNueva((v) => !v)}>
                                                {mostrarNueva ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                label="Confirmar nueva contraseña"
                                type={mostrarConfirm ? "text" : "password"}
                                value={cpConfirm}
                                onChange={(e) => setCpConfirm(e.target.value)}
                                size="small"
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setMostrarConfirm((v) => !v)}>
                                                {mostrarConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCerrarCambioPassword} disabled={cpCargando}>
                        {cpExito ? "Cerrar" : "Cancelar"}
                    </Button>
                    {!cpExito && (
                        <Button
                            variant="contained"
                            onClick={handleSubmitCambioPassword}
                            disabled={cpCargando}
                        >
                            {cpCargando ? <CircularProgress size={18} /> : "Guardar"}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default HomeView;
