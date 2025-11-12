// Product module models
import { MgItbis } from "../facturacion";
import { InAlmacen } from "../inventario";
import { SgMenu } from "../seguridad";

export interface MgUnidad {
    id: string;
    nombre: string;
    abreviacion: string;
    descripcion?: string;
    activo: boolean;
}

export interface MgCategoria {
    id?: number;
    secuencia?: string;
    categoria: string;
    modificable: boolean;
    tieneModulo: boolean;
    // From BaseEntity
    usuarioReg?: string;
    fechaReg?: Date;
    estadoId?: string;
    activo: boolean;
}

export interface MgUnidadFraccion {
    id?: number;
    existencia?: number;
    precioVenta?: number;
    precioMinimo?: number;
    disponibleEnCompra?: boolean;
    disponibleEnVenta?: boolean;
    precioCostoAvg?: number;
    cantidad: number;
    unidadId: MgUnidad;
    unidadFraccionId: MgUnidad;
    productoId?: MgProducto;
    usuarioReg?: string;
    fechaReg?: Date;
    estadoId?: string;
}

export interface MgProductoAlmacenLimite {
    id?: number;
    limite?: number;
    almacenId: InAlmacen;
    // From BaseEntity
    usuarioReg?: string;
    fechaReg?: Date;
    estadoId?: string;
}

export interface MgProductoModulo {
    id?: number;
    sgMenuId: SgMenu;
    // From BaseEntity
    usuarioReg?: string;
    fechaReg?: Date;
    estadoId?: string;
}

export interface MgProducto {
    id?: number;
    codigoBarra?: string;
    nombreProducto: string;
    descripcion?: string;
    unidadId?: string;
    existencia?: number;
    precioVenta?: number;
    precioMinimo?: number;
    soloEnCompra?: boolean;
    precioCostoAvg?: number;
    trabajador?: boolean;
    comision?: number;
    itbisId: MgItbis;
    categoriaId: MgCategoria;
    unidadFraccions?: MgUnidadFraccion[];
    productosAlmacenesLimites?: MgProductoAlmacenLimite[];
    productosModulos?: MgProductoModulo[];
}
