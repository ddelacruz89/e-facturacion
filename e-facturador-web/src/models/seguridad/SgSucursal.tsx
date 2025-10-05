import { SgEmpresa } from "./SgEmpresa";

export interface SgSucursal {
    id: number;
    nombre: string;
    encargado: string;
    direccion: string;
    email: string;
    empresa: SgEmpresa;
}
