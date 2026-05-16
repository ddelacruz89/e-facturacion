export interface SgEmpresa {
    usuario_reg: string;
    fechaReg: Date;
    activo: boolean;
    id?: number;
    empresa: string;
    rnc: string;
    razonSocial: string;
    telefono: string;
    correo: string;
    direccion: string;
    logo?: number[] | null; // se puede ajustar según cómo manejes los archivos binarios
}
export interface SgUsuario {
    username: string;
    empresaId?: number;
    loginEmail?: string;
    password: string;
    cambioPassword?: boolean;
    nombre: string;
    estadoId?: string;
    fechaReg?: string;
    usuarioReg?: string;
}

export interface SgUsuarioResumenDTO {
    username: string;
    nombre: string;
    loginEmail?: string;
    fechaReg: string;
    usuarioReg: string;
    estadoId?: string;
}

export interface SgUsuarioSearchCriteria {
    q?: string;
    fechaInicio?: string;
    fechaFin?: string;
}
export interface SgPermiso {
    id?: number;
    empresaId?: number;
    activo?: boolean;
    fechaReg?: string;
    usuarioReg?: string;
    /** FK a sg_menu — puede llegar como objeto en GET, se envía como { id } en POST */
    menu: { id: number; menu?: string; url?: string; moduloId?: string } | number;
    puedeLeer: boolean;
    puedeEscribir: boolean;
    puedeEliminar: boolean;
    puedeImprimir: boolean;
}

export interface SgRol {
    id?: number;
    empresaId?: number;
    secuencia?: number;
    activo: boolean;
    fechaReg?: string;
    usuarioReg?: string;
    nombre: string;
    descripcion?: string;
    permisos: SgPermiso[];
}

export interface SgRolResumenDTO {
    id: number;
    fechaReg: string;
    nombre: string;
    descripcion?: string;
    cantidadPermisos: number;
    cantidadUsuarios: number;
    usuarioReg: string;
    activo: boolean;
}

export interface SgRolSearchCriteria {
    nombre?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface SgUsuarioRol {
    id?: number;
    empresaId?: number;
    activo?: boolean;
    fechaReg?: string;
    usuarioReg?: string;
    usuario: { username: string; nombre: string };
    sucursalId: { id: number; nombre: string };
}

export interface MenuDto {
    id: number;
    menu: string;
    urlSql: string;
    url: string;
}

export interface ModuloDto {
    id: string;
    menus: MenuDto[];
    modulo: string;
}

export interface SgMenu {
    id?: number;
    menu: string;
    descripcion?: string;
    url?: string;
    icono?: string;
    orden?: number;
    activo?: boolean;
    // From BaseEntity
    usuarioReg?: string;
    fechaReg?: Date;
    estadoId?: string;
}

export interface SgMenuResumenDTO {
    id?: number;
    menu: string;
}
