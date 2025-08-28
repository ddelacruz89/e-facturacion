import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import './menu.css'; // Asegúrate de que la ruta sea correcta
import logo from "./assets/logo-braintech.png";

const HomeView = () => {
    const [mostrarPanel, setMostrarPanel] = useState(false);
    const navigate = useNavigate();

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
                    onClick={() => setMostrarPanel(!mostrarPanel)}
                >
                    <div className='short-menu'>
                        <ul>
                            <li className="seg">SEG</li>
                            <li className="seg">SEG</li>
                        </ul>

                    </div>

                </div>
                {mostrarPanel && (
                    <div className="menu-panel">
                        <div className="tittle-menu" style={{}}>Seguridad <div className="exit-menu" onClick={() => setMostrarPanel(false)}>X</div></div>
                        <ul>
                            <li
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
