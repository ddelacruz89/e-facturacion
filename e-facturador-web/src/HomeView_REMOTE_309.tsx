import { Outlet, Link, useNavigate } from "react-router-dom";
import { use, useEffect, useState } from "react";
import './menu.css'; // Asegúrate de que la ruta sea correcta
import logo from "./assets/logo-braintech.png";
import { getModulos } from "./apis/ModulosController";
import { ModuloDto } from "./models/seguridad";

const HomeView = () => {
    const [mostrarPanel, setMostrarPanel] = useState(false);
    const navigate = useNavigate();
    const [modulos, setModulos] = useState<ModuloDto[]>([]);
    const [moduloActivo, setModuloActivo] = useState<ModuloDto>({ id: '', menus: [], modulo: '' });

    useEffect(() => {
        getModulos().then(modulos => setModulos(modulos));
    }, []);

    const handleNavigation = (path: string) => {
        navigate(path);
        setMostrarPanel(false); // Ocultar el panel al navegar}     
    }
    return (
        <div className="container-main">
            <div className="top"> </div>
            <div className="left">
                <div
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                // onClick={() => setMostrarPanel(!mostrarPanel)}
                >
                    <div className='short-menu'>
                        <ul>
                            {modulos.map(modulo => (
                                <li key={modulo.id} className="seg" title={modulo.modulo} data-active={moduloActivo.id === modulo.id}
                                    onClick={() => {
                                        setMostrarPanel(true);
                                        setModuloActivo(modulo)
                                    }}>
                                    {modulo.modulo.substring(0, 3).toUpperCase()}
                                </li>
                            ))}
                        </ul>

                    </div>

                </div>
                {mostrarPanel && (
                    <div className="menu-panel">
                        <div className="tittle-menu" style={{}}>{moduloActivo.modulo} <div className="exit-menu" onClick={() => setMostrarPanel(false)}>X</div></div>
                        <ul>
                            {moduloActivo.menus.map(menu => <li
                                className="menu-item"
                                onClick={() => handleNavigation(menu.url)}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                                {menu.menu}
                            </li>
                            )}
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
            <div className="foot"><img src={logo} alt="Mi Logo" width="125" /> </div>
        </div >
    );
};

export default HomeView;
