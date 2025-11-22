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
    username: string; // Clave primaria, única
    empresaId?: number | 0; // Puede ser null u opcional
    password: string; // Requerido
    cambioPassword?: boolean | false; // Opcional
    nombre: string; // Requerido
}
export interface SgRol {
    id?: number; // opcional si lo generas automáticamente
    nombre: string;
    descripcion: string;
    permisos: string[]; // o un objeto más complejo si tienes una estructura de permisos
}
export interface SgPermiso {
    id?: number; // opcional si lo generas automáticamente
    nombre: string;
    descripcion: string;
    ruta: string; // ruta de la API o del frontend
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
