import apiClient from "../services/apiClient";
import { MfSucursalItbis } from "../models/facturacion";
import { DataNotFound } from "../models/ServerErros";

const api = "/api/v1/facturacion/mf-sucursal-itbis";

export function getMfSucursalItbis(): Promise<MfSucursalItbis[]> {
    return apiClient
        .get(`${api}/all`)
        .then((x: { data: MfSucursalItbis[] }) => x.data)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return [];
        });
}

export function saveMfSucursalItbis(mfSucursalItbis: MfSucursalItbis): Promise<MfSucursalItbis | any> {
    console.log("saveMfSucursalItbis", mfSucursalItbis);
    return apiClient
        .post(api, mfSucursalItbis)
        .then((x: { data: MfSucursalItbis }) => x.data)
        .catch((error) => {
            const response: DataNotFound = error.response.data.error;
            console.error("Mensaje:", response.message);
            return {
                nombre: "",
                itbis: 0,
                activo: true,
                empresaId: 0,
                usuarioReg: "",
                fechaReg: new Date(),
                sucursalId: 0,
                mgItbisId: 0,
            };
        });
}
