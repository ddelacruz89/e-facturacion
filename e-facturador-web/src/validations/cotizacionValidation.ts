import * as Yup from "yup";
import { InCotizacionFormDTO, InCotizacionDetalleFormDTO } from "../models/inventario";

// Validation schema for cotizacion detalle
const cotizacionDetalleSchema = Yup.object().shape({
    productoId: Yup.mixed()
        .required("El producto es requerido")
        .test("producto-valid", "Seleccione un producto válido", (value: any) => {
            if (typeof value === "object" && value !== null) {
                return value.id !== undefined && value.id !== 0;
            }
            return value !== 0 && value !== undefined;
        }),

    suplidorId: Yup.mixed()
        .required("El suplidor es requerido")
        .test("suplidor-valid", "Seleccione un suplidor válido", (value: any) => {
            if (typeof value === "object" && value !== null) {
                return value.id !== undefined && value.id !== 0;
            }
            return value !== 0 && value !== undefined;
        }),

    cantidad: Yup.number()
        .required("La cantidad es requerida")
        .positive("La cantidad debe ser mayor a cero")
        .integer("La cantidad debe ser un número entero")
        .min(1, "La cantidad mínima es 1"),

    cantidadTablar: Yup.number()
        .nullable()
        .min(0, "La cantidad tablar no puede ser negativa"),

    cantidadPedida: Yup.number()
        .nullable()
        .integer("La cantidad pedida debe ser un número entero")
        .min(0, "La cantidad pedida no puede ser negativa"),

    precioCompra: Yup.number()
        .required("El precio de compra es requerido")
        .positive("El precio de compra debe ser mayor a cero")
        .min(0.01, "El precio de compra debe ser mayor a cero"),

    precioVenta: Yup.number()
        .nullable()
        .min(0, "El precio de venta no puede ser negativo"),

    itbisPorciento: Yup.number()
        .nullable()
        .min(0, "El porcentaje de ITBIS no puede ser negativo")
        .max(100, "El porcentaje de ITBIS no puede exceder 100%"),

    itbis: Yup.number()
        .nullable()
        .min(0, "El ITBIS no puede ser negativo"),

    subTotal: Yup.number()
        .nullable()
        .min(0, "El subtotal no puede ser negativo"),

    total: Yup.number()
        .nullable()
        .min(0, "El total no puede ser negativo"),
});

// Validation schema for cotizacion
const cotizacionSchema = Yup.object().shape({
    descripcion: Yup.string()
        .required("La descripción es requerida")
        .min(3, "La descripción debe tener al menos 3 caracteres")
        .max(500, "La descripción no puede exceder 500 caracteres"),

    prioridad: Yup.string()
        .required("La prioridad es requerida")
        .oneOf(["BAJA", "MEDIA", "ALTA", "URGENTE"], "Seleccione una prioridad válida"),

    sucursalId: Yup.mixed()
        .required("La sucursal es requerida")
        .test("sucursal-valid", "Seleccione una sucursal válida", (value: any) => {
            if (typeof value === "object" && value !== null) {
                return value.id !== undefined && value.id !== 0;
            }
            return value !== 0 && value !== undefined;
        }),

    detalles: Yup.array()
        .of(cotizacionDetalleSchema)
        .min(1, "Debe agregar al menos un detalle a la cotización")
        .required("Los detalles son requeridos"),
});

// Validation function for cotizacion
export const validateCotizacion = async (
    cotizacion: InCotizacionFormDTO
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
        await cotizacionSchema.validate(cotizacion, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (validationError: any) {
        const errors: Record<string, string> = {};
        validationError.inner.forEach((error: any) => {
            if (error.path) {
                errors[error.path] = error.message;
            }
        });
        return { isValid: false, errors };
    }
};

// Validation function for cotizacion detalle
export const validateCotizacionDetalle = async (
    detalle: InCotizacionDetalleFormDTO
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
        await cotizacionDetalleSchema.validate(detalle, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (validationError: any) {
        const errors: Record<string, string> = {};
        validationError.inner.forEach((error: any) => {
            if (error.path) {
                errors[error.path] = error.message;
            }
        });
        return { isValid: false, errors };
    }
};

// Custom validation for business rules
export const validateCotizacionBusinessRules = (
    cotizacion: InCotizacionFormDTO
): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate that all detalles have different products
    const productIds = cotizacion.detalles?.map((d) => d.productoId) || [];
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
        errors.push("No puede agregar el mismo producto más de una vez");
    }

    // Validate that precio venta is greater than precio compra
    cotizacion.detalles?.forEach((detalle, index) => {
        if (
            detalle.precioVenta &&
            detalle.precioCompra &&
            detalle.precioVenta < detalle.precioCompra
        ) {
            errors.push(
                `Detalle ${index + 1}: El precio de venta no puede ser menor que el precio de compra`
            );
        }
    });

    // Validate calculations
    cotizacion.detalles?.forEach((detalle, index) => {
        if (detalle.cantidad && detalle.precioCompra) {
            const expectedSubTotal = detalle.cantidad * detalle.precioCompra;
            if (detalle.subTotal && Math.abs(detalle.subTotal - expectedSubTotal) > 0.01) {
                errors.push(`Detalle ${index + 1}: El subtotal no coincide con la cantidad y el precio`);
            }
        }
    });

    return { isValid: errors.length === 0, errors };
};

export default cotizacionSchema;
