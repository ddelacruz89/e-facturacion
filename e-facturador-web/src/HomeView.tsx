import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Button, Box, Typography } from "@mui/material";
import { ExitToApp } from "@mui/icons-material";
import "./menu.css"; // Asegúrate de que la ruta sea correcta
import { useState } from "react";
import logo from "./assets/logo-braintech.png";
import { useSharedModulos } from "./hooks/useSharedModulos";
import { ModuloDto } from "./models/seguridad";

const HomeView = () => {
    const [mostrarPanel, setMostrarPanel] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [moduloActivo, setModuloActivo] = useState<ModuloDto>({ id: "", menus: [], modulo: "" });

    const { data: modulos } = useSharedModulos();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="container-main">
            <div className="top">
                {/* User info and logout section */}
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
                        Bienvenido, <strong>{user?.username}</strong> | Empresa: <strong>{user?.empresaId}</strong>
                        {user?.sucursalId && ` | Sucursal: ${user.sucursalId}`}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<ExitToApp />}
                        onClick={handleLogout}
                        sx={{ minWidth: "auto" }}>
                        Cerrar Sesión
                    </Button>
                </Box>
            </div>
            <div className="left">
                <div
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                >
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
                        <div className="tittle-menu" style={{}}>
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

            {/* MAIN CONTENT */}
            <div className="center" style={{ flex: 1, padding: "1rem" }}>
                <Outlet />
            </div>
            <div className="foot">
                <img src={logo} alt="Braintech" style={{ height: "40px" }} />
            </div>
        </div>
    );
};

export default HomeView;
