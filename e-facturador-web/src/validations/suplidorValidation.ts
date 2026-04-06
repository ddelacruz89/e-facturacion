import * as Yup from "yup";
import { InSuplidor } from "../models/inventario";

const suplidorSchema = Yup.object().shape({
    nombre: Yup.string()
        .required("El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(200, "El nombre no puede exceder 200 caracteres"),

    rnc: Yup.string()
        .max(50, "El RNC no puede exceder 50 caracteres")
        .nullable(),

    direccion: Yup.string()
        .max(500, "La dirección no puede exceder 500 caracteres")
        .nullable(),

    contacto1: Yup.string()
        .max(100, "El contacto 1 no puede exceder 100 caracteres")
        .nullable(),

    contacto2: Yup.string()
        .max(100, "El contacto 2 no puede exceder 100 caracteres")
        .nullable(),

    telefono1: Yup.string()
        .max(20, "El teléfono 1 no puede exceder 20 caracteres")
        .nullable(),

    telefono2: Yup.string()
        .max(20, "El teléfono 2 no puede exceder 20 caracteres")
        .nullable(),

    correo1: Yup.string()
        .email("El correo 1 debe ser válido")
        .max(100, "El correo 1 no puede exceder 100 caracteres")
        .nullable(),

    correo2: Yup.string()
        .email("El correo 2 debe ser válido")
        .max(100, "El correo 2 no puede exceder 100 caracteres")
        .nullable(),

    servicio: Yup.boolean().nullable(),

    producto: Yup.boolean().nullable(),

    estadoId: Yup.string()
        .required("El estado es requerido")
        .max(1, "El estado ID debe ser 1 caracter"),

    tipoComprobante: Yup.object()
        .shape({
            id: Yup.string().required("El tipo de comprobante es requerido"),
            tipoComprobante: Yup.string().nullable(),
            electronico: Yup.boolean().nullable(),
        })
        .required("El tipo de comprobante es requerido"),

    activo: Yup.boolean().nullable(),
});

export const validateSuplidor = async (
    data: InSuplidor
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
        await suplidorSchema.validate(data, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (error) {
        if (error instanceof Yup.ValidationError) {
            const errors: Record<string, string> = {};
            error.inner.forEach((err) => {
                if (err.path) {
                    errors[err.path] = err.message;
                }
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: { general: "Error de validación desconocido" } };
    }
};
