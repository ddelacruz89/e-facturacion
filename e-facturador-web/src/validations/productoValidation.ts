import * as Yup from "yup";
import { MgProducto } from "../models/producto";

const productoSchema = Yup.object().shape({
    nombreProducto: Yup.string()
        .required("El nombre del producto es requerido")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(200, "El nombre no puede exceder 200 caracteres"),

    categoriaId: Yup.mixed()
        .required("La categoría es requerida")
        .test("categoria-valid", "Seleccione una categoría válida", (value: any) => {
            if (typeof value === "object" && value !== null) {
                return value.id !== undefined && value.id !== 0;
            }
            return value !== 0 && value !== undefined;
        }),

    itbisId: Yup.mixed()
        .required("El ITBIS es requerido")
        .test("itbis-valid", "Seleccione un ITBIS válido", (value: any) => {
            if (typeof value === "object" && value !== null) {
                return value.id !== undefined && value.id !== 0;
            }
            return value !== 0 && value !== undefined;
        }),

    activo: Yup.boolean().required(),

    // Validaciones condicionales cuando el producto está activo
    precioVenta: Yup.number().when("activo", {
        is: true,
        then: (schema) => schema
            .required("El precio de venta es requerido para productos activos")
            .positive("El precio de venta debe ser mayor a cero")
            .min(0.01, "El precio de venta debe ser mayor a cero")
            .test(
                "precio-venta-mayor-o-igual-minimo",
                "El precio de venta no puede ser menor que el precio minimo",
                function (value) {
                    const precioMinimo = this.parent.precioMinimo;

                    if (value === undefined || value === null || precioMinimo === undefined || precioMinimo === null) {
                        return true;
                    }

                    return Number(value) >= Number(precioMinimo);
                },
            ),
        otherwise: (schema) => schema.nullable(),
    }),

    precioMinimo: Yup.number().when("activo", {
        is: true,
        then: (schema) => schema
            .required("El precio mínimo es requerido para productos activos")
            .positive("El precio mínimo debe ser mayor a cero")
            .min(0.01, "El precio mínimo debe ser mayor a cero")
            .test(
                "precio-minimo-menor-o-igual-venta",
                "El precio minimo no puede ser mayor que el precio de venta",
                function (value) {
                    const precioVenta = this.parent.precioVenta;

                    if (value === undefined || value === null || precioVenta === undefined || precioVenta === null) {
                        return true;
                    }

                    return Number(value) <= Number(precioVenta);
                },
            ),
        otherwise: (schema) => schema.nullable(),
    }),

    unidadProductorSuplidor: Yup.array().when("activo", {
        is: true,
        then: (schema) => schema
            .min(1, "Debe agregar al menos una unidad para productos activos")
            .test(
                "has-suppliers",
                "Cada unidad debe tener al menos un proveedor asignado",
                function (unidades) {
                    if (!unidades || unidades.length === 0) return false;
                    
                    // Verificar que todas las unidades activas tengan al menos un proveedor
                    return unidades.every((unidad: any) => {
                        // Si la unidad está inactiva, no validar proveedores
                        if (unidad.activo === false) return true;
                        
                        return (
                            unidad.productosSuplidores &&
                            unidad.productosSuplidores.length > 0
                        );
                    });
                }
            ),
        otherwise: (schema) => schema.nullable(),
    }),

    // Validaciones opcionales
    codigoBarra: Yup.string().max(50, "El código de barra no puede exceder 50 caracteres").nullable(),

    descripcion: Yup.string().max(500, "La descripción no puede exceder 500 caracteres").nullable(),

    existencia: Yup.number()
        .min(0, "La existencia no puede ser negativa")
        .nullable(),

    precio: Yup.number()
        .min(0, "El precio de costo no puede ser negativo")
        .nullable(),

    precioCostoAvg: Yup.number()
        .min(0, "El precio de costo promedio no puede ser negativo")
        .nullable(),

    comision: Yup.number().when("trabajador", {
        is: true,
        then: (schema) => schema
            .required("La comisión es requerida cuando el producto es para trabajador")
            .min(0, "La comisión no puede ser negativa"),
        otherwise: (schema) => schema.nullable(),
    }),
});

export const validateProducto = async (
    data: MgProducto
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
        await productoSchema.validate(data, { abortEarly: false });
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
