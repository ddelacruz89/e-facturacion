export interface SgEmpresa {
    id: number;
    empresa: string;
    rnc: string;
    razonSocial: string;
    telefono: string;
    correo: string;
    direccion: string;
    logo?: Uint8Array;
}
