import { SgEmpresa } from "./SgEmpresa";

export interface SgSucursal {
    id?: number; // Optional since it's auto-generated
    nombre: string;
    encargado: string;
    direccion: string;
    email: string;
    estadoId: string;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    empresa: SgEmpresa; // ManyToOne relationship
}
