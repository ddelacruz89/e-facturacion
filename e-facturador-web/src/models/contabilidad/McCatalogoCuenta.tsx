export interface McTipoCuenta {
    id: number;
    tipoCuenta: string;
    /** true = naturaleza crédito; false = naturaleza débito */
    cr: boolean;
}

/** Objeto completo — retornado por GET /{id}, usado para editar. */
export interface McCatalogoCuenta {
    id: number;
    empresaId?: number;
    tipoCuentaId: McTipoCuenta;
    cuentaPadreId?: McCatalogoCuenta | null;
    nivel1?: string;
    nivel2?: string;
    nivel3?: string;
    nivel4?: string;
    nivel?: number;
    orden?: number;
    cuenta: string;
    nombreCuenta: string;
    permiteMovimiento: boolean;
    saldoCuenta?: number;
    control?: string;
    usuarioReg?: string;
    fechaReg?: string;
    estadoId?: string;
}

/** Payload de creación/edición. */
export interface McCatalogoCuentaRequestDTO {
    tipoCuentaId: number;
    cuentaPadreId?: number | null;
    nivel1?: string;
    nivel2?: string;
    nivel3?: string;
    nivel4?: string;
    nivel?: number;
    orden?: number;
    cuenta: string;
    nombreCuenta: string;
}

/** Sugerencia del código de la próxima sub-cuenta a crear bajo un padre. */
export interface McCatalogoCuentaSugerenciaDTO {
    nivel: number;
    nivel1?: string;
    nivel2?: string;
    nivel3?: string;
    nivel4?: string;
    cuenta: string;
    orden: number;
    permiteMovimiento: boolean;
}

/** Nodo del árbol — mínima data para pintar una fila (nivel raíz o hijos de un padre). */
export interface McCatalogoCuentaNodoDTO {
    id: number;
    cuentaPadreId: number | null;
    cuenta: string;
    nombreCuenta: string;
    nivel: number;
    permiteMovimiento: boolean;
    saldoCuenta?: number;
    estadoId: string;
    tipoCuentaId: number;
    tipoCuentaNombre: string;
    tieneHijos: boolean;
}
