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
