import * as Yup from "yup";
import { InRequisicion } from "../models/inventario/InRequisicion";

const requisicionSchema = Yup.object().shape({
    almacenSolicitanteId: Yup.number()
        .required("Seleccione el almacén solicitante")
        .typeError("Seleccione el almacén solicitante"),

    almacenOrigenId: Yup.number()
        .required("Seleccione el almacén origen")
        .typeError("Seleccione el almacén origen")
        .test(
            "almacen-diferente",
            "El almacén origen no puede ser el mismo que el solicitante",
            function (value) {
                return value !== this.parent.almacenSolicitanteId;
            }
        ),

    prioridad: Yup.string()
        .oneOf(["ALTA", "MEDIA", "BAJA"], "Prioridad inválida")
        .required("Seleccione la prioridad"),

    fechaRequerida: Yup.string()
        .required("La fecha requerida es obligatoria")
        .typeError("La fecha requerida es obligatoria"),

    detalles: Yup.array()
        .min(1, "Agregue al menos un producto a la requisición")
        .required("Agregue al menos un producto"),

    observaciones: Yup.string().nullable(),
});

export const validateRequisicion = async (
    data: InRequisicion
): Promise<{ isValid: boolean; firstError: string }> => {
    try {
        await requisicionSchema.validate(data, { abortEarly: true });
        return { isValid: true, firstError: "" };
    } catch (e: any) {
        return { isValid: false, firstError: e.message ?? "Error de validación" };
    }
};
