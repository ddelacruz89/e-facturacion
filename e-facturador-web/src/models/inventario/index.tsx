// Inventario module models

export interface InAlmacen {
    id?: number;
    nombre: string;
    descripcion?: string;
    activo?: boolean;
    // From BaseEntity
    usuarioReg?: string;
    fechaReg?: Date;
    estadoId?: string;
}

// Simple DTO for suplidor resumen endpoint
export interface InSuplidorSimpleDTO {
    id: number;
    nombre: string;
    rnc?: string;
}

// Re-export from individual files
export type { InSuplidor } from "./InSuplidor";
