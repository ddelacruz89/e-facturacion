import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Button, Box, Typography } from "@mui/material";
import { ExitToApp } from "@mui/icons-material";
import "./menu.css"; // Asegúrate de que la ruta sea correcta
import { use, useEffect, useState } from "react";
import "./menu.css"; // Asegúrate de que la ruta sea correcta
import logo from "./assets/logo-braintech.png";
import { getModulos } from "./apis/ModulosController";
import { ModuloDto } from "./models/seguridad";

const HomeView = () => {
    const [mostrarPanel, setMostrarPanel] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [modulos, setModulos] = useState<ModuloDto[]>([]);
    const [moduloActivo, setModuloActivo] = useState<ModuloDto>({ id: "", menus: [], modulo: "" });

    useEffect(() => {
        getModulos().then((loadedModulos) => {
            // Add temporary Suplidores menu for testing
            const updatedModulos = loadedModulos.map((modulo) => {
                if (modulo.id === "INV") {
                    return {
                        ...modulo,
                        menus: [
                            ...modulo.menus,
                            {
                                id: 11,
                                menu: "Suplidores",
                                urlSql: "/suplidores",
                                url: "/suplidores",
                            },
                        ],
                    };
                }
                return modulo;
            });

            // If INV module doesn't exist, create it
            const invModuleExists = updatedModulos.some((modulo) => modulo.id === "INV");
            if (!invModuleExists) {
                updatedModulos.push({
                    id: "INV",
                    modulo: "Inventario",
                    menus: [
                        {
                            id: 11,
                            menu: "Suplidores",
                            urlSql: "/suplidores",
                            url: "/suplidores",
                        },
                    ],
                });
            }

            setModulos(updatedModulos);
        });
    }, []);

    const handleNavigation = (path: string) => {
        navigate(path);
        setMostrarPanel(false); // Ocultar el panel al navegar}
    };

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
                    // onClick={() => setMostrarPanel(!mostrarPanel)}
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
                                <li
                                    className="menu-item"
                                    onClick={() => handleNavigation(menu.url)}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                                    {menu.menu}
                                </li>
                            ))}
                            {/* <li
                                className="menu-item"
                                onClick={() => handleNavigation("/empresa")}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                            >Empresa</li>
                            <li
                                className="menu-item"
                                onClick={() => handleNavigation("/usuario")}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                            >Usuario</li>
                            <li
                                className="menu-item"
                                onClick={() => handleNavigation("/tipo/factura")}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                            >Tipo Factura</li>
                            <li
                                className="menu-item"
                                onClick={() => handleNavigation("/tipo/itbis")}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                            >Tipo ITBIS</li>
                            <li
                                className="menu-item"
                                onClick={() => handleNavigation("/tipo/comprobante")}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                            >Tipo Comprobante</li>
                            <li
                                className="menu-item"
                                onClick={() => handleNavigation("/facturacion")}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                            >Facturacion</li> */}
                        </ul>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="center" style={{ flex: 1, padding: "1rem" }}>
                <Outlet />
            </div>
            <div className="foot">
                <img src={logo} alt="Mi Logo" width="125" />{" "}
            </div>
        </div>
    );
};

export default HomeView;
