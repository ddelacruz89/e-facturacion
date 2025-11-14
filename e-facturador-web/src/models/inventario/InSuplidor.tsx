export interface InSuplidor {
    // From BaseEntityPk
    id?: number;
    empresaId?: number;
    secuencia?: number;

    // From BaseEntity
    usuarioReg?: string;
    fechaReg?: Date;
    activo?: boolean;

    // From InSuplidor entity
    nombre: string; // @Basic(optional = false)
    rnc?: string;
    direccion?: string;
    contacto1?: string;
    contacto2?: string;
    telefono1?: string;
    telefono2?: string;
    correo1?: string; // @Email validated
    correo2?: string; // @Email validated
    servicio?: boolean;
    producto?: boolean;
    estadoId?: string; // @Column(name = "estado_id")
}
