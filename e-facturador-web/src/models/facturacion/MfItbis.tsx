export interface MfItbis {
    id: number;
    secuencia: number;
    empresaId: number;
    fechaReg: string;
    usuarioReg: string;
    nombre: string;
    itbis: number;
    cuentaContable?: string;
    mgItbis: {
        id: number;
        nombre: string;
        itbis: number;
    };
}

export interface MfItbisRequest {
    nombre: string;
    itbis: number;
    cuentaContable?: string;
    mgItbisId: number;
}
