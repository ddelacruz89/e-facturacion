// Import or define SgSucursal before using it
// Example import (uncomment and adjust the path as needed):
import { SgSucursal } from "./seguridad/SgSucursal";

export interface BaseSucursal {
    usuarioReg: string;
    fechaReg: Date;
    estadoId?: string;
    sucursalId: SgSucursal;
}
