import * as Yup from "yup";
import { InSuplidor } from "../models/inventario";

/**
 * Devuelve true si el tipo de comprobante exige identificación fiscal.
 * El tipo "43" es Consumidor Final y NO requiere cédula/RNC.
 */
const requiereIdentificacion = (tipoComprobante: any): boolean =>
    tipoComprobante?.id !== "43";

const suplidorSchema = Yup.object().shape({
    nombre: Yup.string()
        .required("El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(200, "El nombre no puede exceder 200 caracteres"),

    razonSocial: Yup.string()
        .required("La razón social es requerida")
        .min(2, "La razón social debe tener al menos 2 caracteres")
        .max(255, "La razón social no puede exceder 255 caracteres"),

    tipoIdentificacion: Yup.string().nullable(),

    /**
     * rnc almacena solo dígitos (sin formato).
     * - Requerido cuando tipoComprobante.id !== "43"
     * - Cédula (C): exactamente 11 dígitos
     * - RNC    (R): exactamente  9 dígitos
     */
    rnc: Yup.string()
        .nullable()
        .test("rnc-requerido-y-valido", "", function (value) {
            const { tipoIdentificacion, tipoComprobante } = this.parent as InSuplidor;

            if (!requiereIdentificacion(tipoComprobante)) return true;

            const digits = (value ?? "").replace(/\D/g, "");

            if (!digits) {
                return this.createError({
                    message:
                        tipoIdentificacion === "C"
                            ? "La cédula es requerida"
                            : "El RNC es requerido",
                });
            }

            if (tipoIdentificacion === "C") {
                if (digits.length !== 11) {
                    return this.createError({
                        message: "La cédula debe tener exactamente 11 dígitos",
                    });
                }
            } else {
                if (digits.length !== 9) {
                    return this.createError({
                        message: "El RNC debe tener exactamente 9 dígitos",
                    });
                }
            }

            return true;
        }),

    direccion: Yup.string()
        .max(500, "La dirección no puede exceder 500 caracteres")
        .nullable(),

    contacto1: Yup.string()
        .required("El contacto principal es requerido")
        .max(100, "El contacto principal no puede exceder 100 caracteres"),

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
