import apiClient from "../services/apiClient";
import { McTipoCuenta } from "../models/contabilidad/McCuenta";

const api = "/api/v1/contabilidad/tipos-cuenta";

/** Catálogo global y estable — sin paginar. */
export function getTiposCuenta(): Promise<McTipoCuenta[]> {
    return apiClient.get(api).then((x: { data: McTipoCuenta[] }) => x.data);
}
