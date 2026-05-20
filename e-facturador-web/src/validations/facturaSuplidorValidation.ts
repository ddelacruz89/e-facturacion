import * as Yup from "yup";
import { MfFacturaSuplidorRequest } from "../models/facturacion/MfFacturaSuplidor";

// Tipos de comprobante que tienen reglas especiales sobre suplidor
// 41 = Comprobante Electrónico de Compras   → suplidor OBLIGATORIO
// 43 = Comprobante para Gastos Menores      → suplidor NO debe especificarse
// 47 = Comprobante para Pagos al Exterior   → suplidor OPCIONAL

// SuplidorComboBox stores the selected value as { id, nombre } instead of a plain number.
// This helper extracts a numeric ID from either form.
const resolveSuplidorId = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "object") {
        const n = Number(value.id);
        return isNaN(n) || n === 0 ? null : n;
    }
    const n = Number(value);
    return isNaN(n) || n === 0 ? null : n;
};

const facturaSuplidorSchema = Yup.object().shape({

    tipoCfId: Yup.string()
        .required("El tipo de comprobante es requerido"),

    suplidorId: Yup.mixed()
        .nullable()
        .when("tipoCfId", {
            is: "41",
            then: (schema) =>
                schema.test(
                    "suplidor-required",
                    "El suplidor es obligatorio para el tipo de comprobante 41",
                    (value) => resolveSuplidorId(value) !== null,
                ),
            otherwise: (schema) => schema.nullable(),
        }),

    tipoFacturaId: Yup.number().nullable().optional(),

    estadoId: Yup.string()
        .required("El estado es requerido"),

    tipoPago: Yup.number().required("El tipo de pago es requerido"),

    fechaLimitePago: Yup.string()
        .nullable()
        .when("tipoPago", {
            is: 2,
            then: (schema) =>
                schema.required("La fecha límite de pago es requerida para crédito"),
            otherwise: (schema) => schema.nullable(),
        }),

    detalles: Yup.array()
        .min(1, "Debe agregar al menos un renglón")
        .required("Debe agregar al menos un renglón"),
});

export type FacturaSuplidorErrors = Record<string, string>;

export const validateFacturaSuplidor = async (
    data: MfFacturaSuplidorRequest
): Promise<{ isValid: boolean; errors: FacturaSuplidorErrors }> => {
    try {
        await facturaSuplidorSchema.validate(data, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (error) {
        if (error instanceof Yup.ValidationError) {
            const errors: FacturaSuplidorErrors = {};
            error.inner.forEach((err) => {
                if (err.path) errors[err.path] = err.message;
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: { general: "Error de validación desconocido" } };
    }
};

/** Reglas de visibilidad/habilitación del campo suplidor según tipo de comprobante */
export const suplidorRuleForTipoCf = (tipoCfId: string | undefined) => {
    if (tipoCfId === "41") return { visible: true,  required: true,  disabled: false, hint: ""                                       };
    if (tipoCfId === "43") return { visible: true,  required: false, disabled: true,  hint: "No aplica para gastos menores (CF 43)"  };
    if (tipoCfId === "47") return { visible: true,  required: false, disabled: false, hint: "Opcional para pagos al exterior (CF 47)" };
    return                        { visible: true,  required: false, disabled: false, hint: ""                                       };
};
