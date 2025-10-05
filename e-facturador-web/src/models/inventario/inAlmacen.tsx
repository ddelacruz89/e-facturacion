import { BaseSucursal } from "../BaseSucursal";

export interface InAlmacen extends BaseSucursal {
    id: number;
    nombre: string;
    ubicacion?: string;
}
