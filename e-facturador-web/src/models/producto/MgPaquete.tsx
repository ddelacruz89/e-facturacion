import { ComboBoxReference } from "./index";

// ---------------------------------------------------------------------------
// Entidades del dominio
// ---------------------------------------------------------------------------

export interface MgPaquete {
    id?: number;
    empresaId?: number;
    secuencia?: number;
    usuarioReg?: string;
    fechaReg?: Date;
    activo: boolean;

    nombre: string;
    descripcion?: string;
    codigoBarra?: string;
    precioVenta: number;
    precioMinimo?: number;
    itbisId: number | ComboBoxReference;
    notas?: string;

    items: MgPaqueteItem[];
}

export interface MgPaqueteItem {
    id?: number;
    empresaId?: number;
    usuarioReg?: string;
    fechaReg?: Date;
    activo: boolean;

    /** FK a MgProducto */
    productoId: number | ComboBoxReference;
    /** FK a MgProductoUnidadSuplidor */
    unidadProductorSuplidorId: number | ComboBoxReference;
    cantidad: number;
    precioRef?: number;
    notas?: string;

    // Campos de display (no se envían al backend)
    _productoNombre?: string;
    _unidadNombre?: string;
    _esServicio?: boolean;
}

// ---------------------------------------------------------------------------
// Resumen para la tabla del modal de búsqueda
// ---------------------------------------------------------------------------

export interface MgPaqueteResumenDTO {
    id: number;
    fechaReg: string;
    nombre: string;
    precioVenta: number;
    cantidadItems: number;
    usuarioReg: string;
    activo: boolean;
}

// ---------------------------------------------------------------------------
// Criterios de búsqueda
// ---------------------------------------------------------------------------

export interface MgPaqueteSearchCriteria {
    nombre?: string;
    fechaInicio?: string;
    fechaFin?: string;
}
