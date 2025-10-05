import { BaseSucursal } from "../BaseSucursal";

export interface InSuplidor extends BaseSucursal {
    id: number;
    nombre: string;
    rnc?: string;
    direccion?: string;
    contacto1?: string;
    contacto2?: string;
    telefono1?: string;
    telefono2?: string;
    correo1?: string;
    correo2?: string;
    servicio?: boolean;
    producto?: boolean;
    gastosMenores?: boolean;
}
