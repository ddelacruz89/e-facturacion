export interface MgTag {
    id?: number;
    empresaId: number;
    secuencia?: number;
    usuarioReg: string;
    fechaReg: Date;
    activo: boolean;
    // Add any other tag-specific fields as needed
    nombre?: string; // Common tag field
}
