import * as Yup from "yup";
import { InOrdenCompraFormDTO, InOrdenCompraDetalleFormDTO } from "../models/inventario";

// Validation schema for orden compra detalle
const ordenCompraDetalleSchema = Yup.object().shape({
    productoId: Yup.mixed()
        .required("El producto es requerido")
        .test("producto-valid", "Seleccione un producto válido", (value: any) => {
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

    precioUnitario: Yup.number()
        .required("El precio unitario es requerido")
        .positive("El precio unitario debe ser mayor a cero")
        .min(0.01, "El precio unitario debe ser mayor a cero"),

    cantidadTablar: Yup.number()
        .nullable()
        .min(0, "La cantidad tablar no puede ser negativa"),

    itbisProducto: Yup.number()
        .nullable()
        .min(0, "El ITBIS del producto no puede ser negativo"),

    descuentoPorciento: Yup.number()
        .nullable()
        .min(0, "El porcentaje de descuento no puede ser negativo")
        .max(100, "El porcentaje de descuento no puede exceder 100%"),

    descuentoCantidad: Yup.number()
        .nullable()
        .min(0, "La cantidad de descuento no puede ser negativa"),

    subTotal: Yup.number()
        .required("El subtotal es requerido")
        .min(0, "El subtotal no puede ser negativo"),

    itbis: Yup.number()
        .nullable()
        .min(0, "El ITBIS no puede ser negativo"),

    total: Yup.number()
        .required("El total es requerido")
        .min(0, "El total no puede ser negativo"),
});

// Validation schema for orden compra
const ordenCompraSchema = Yup.object().shape({
    suplidorId: Yup.mixed()
        .required("El suplidor es requerido")
        .test("suplidor-valid", "Seleccione un suplidor válido", (value: any) => {
            if (typeof value === "object" && value !== null) {
                return value.id !== undefined && value.id !== 0;
            }
            return value !== 0 && value !== undefined;
        }),

    detalles: Yup.array()
        .of(ordenCompraDetalleSchema)
        .min(1, "Debe agregar al menos un producto a la orden de compra")
        .required("Los detalles son requeridos"),

    descuento: Yup.number()
        .nullable()
        .min(0, "El descuento no puede ser negativo"),

    subTotal: Yup.number()
        .nullable()
        .min(0, "El subtotal no puede ser negativo"),

    itbis: Yup.number()
        .nullable()
        .min(0, "El ITBIS no puede ser negativo"),

    total: Yup.number()
        .nullable()
        .min(0, "El total no puede ser negativo"),
});

// Validation function for orden compra
export const validateOrdenCompra = async (
    ordenCompra: InOrdenCompraFormDTO
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
        await ordenCompraSchema.validate(ordenCompra, { abortEarly: false });
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

// Validation function for orden compra detalle
export const validateOrdenCompraDetalle = async (
    detalle: InOrdenCompraDetalleFormDTO
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
        await ordenCompraDetalleSchema.validate(detalle, { abortEarly: false });
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
export const validateOrdenCompraBusinessRules = (
    ordenCompra: InOrdenCompraFormDTO
): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const detallesActivos =
        ordenCompra.detalles?.filter((detalle: any) => !detalle?.estadoId || detalle.estadoId === "ACT") || [];

    const getProductoId = (productoId: any): number | undefined => {
        if (typeof productoId === "object" && productoId !== null) {
            return productoId.id;
        }

        return productoId;
    };

    // Validate that all detalles have different products
    const productIds = detallesActivos.map((d) => getProductoId(d.productoId)).filter((id) => id !== undefined);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
        errors.push("No puede agregar el mismo producto más de una vez");
    }

    // Validate calculations
    detallesActivos.forEach((detalle, index) => {
        if (detalle.cantidad && detalle.precioUnitario) {
            const expectedSubtotal = detalle.cantidad * detalle.precioUnitario;
            
            // Apply discount if exists
            let finalSubtotal = expectedSubtotal;
            if (detalle.descuentoCantidad) {
                finalSubtotal -= detalle.descuentoCantidad;
            } else if (detalle.descuentoPorciento) {
                finalSubtotal -= expectedSubtotal * (detalle.descuentoPorciento / 100);
            }

            if (detalle.subTotal && Math.abs(detalle.subTotal - finalSubtotal) > 0.01) {
                errors.push(`Detalle ${index + 1}: El subtotal no coincide con la cantidad y el precio`);
            }
        }

        // Validate discount doesn't exceed subtotal
        if (detalle.descuentoCantidad && detalle.subTotal) {
            if (detalle.descuentoCantidad > (detalle.cantidad * detalle.precioUnitario)) {
                errors.push(`Detalle ${index + 1}: El descuento no puede ser mayor que el subtotal`);
            }
        }
    });

    // Validate total amounts
    const calculatedSubtotal = detallesActivos.reduce((sum, d) => sum + (d.subTotal || 0), 0);
    const calculatedItbis = detallesActivos.reduce((sum, d) => sum + (d.itbis || 0), 0);
    const calculatedTotal = calculatedSubtotal + calculatedItbis - (ordenCompra.descuento || 0);

    if (ordenCompra.subTotal && Math.abs(ordenCompra.subTotal - calculatedSubtotal) > 0.01) {
        errors.push("El subtotal total no coincide con la suma de los detalles");
    }

    if (ordenCompra.itbis && Math.abs(ordenCompra.itbis - calculatedItbis) > 0.01) {
        errors.push("El ITBIS total no coincide con la suma de los detalles");
    }

    if (ordenCompra.total && Math.abs(ordenCompra.total - calculatedTotal) > 0.01) {
        errors.push("El total no coincide con los cálculos");
    }

    return { isValid: errors.length === 0, errors };
};

export default ordenCompraSchema;
