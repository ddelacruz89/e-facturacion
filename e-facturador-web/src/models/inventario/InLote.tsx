export interface InLote {
    lote: string;
    productoId: MgProducto;
    serie: boolean;
    fechaVencimiento: Date;
    fechaAlertaVencimiento: Date;
    alertasDias: number;
    usuarioReg: string;
    fechaReg: Date;
    estado: string;
}
import { MgProducto } from "../producto/MgProducto";
