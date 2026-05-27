import * as Yup from "yup";
import { MgProducto } from "../models/producto";

// ---------------------------------------------------------------------------
// Contexto de validación
// ---------------------------------------------------------------------------
interface ProductoValidationContext {
    /** true cuando la categoría seleccionada es un Servicio (inventario = false) */
    esServicio: boolean;
}

// ---------------------------------------------------------------------------
// Schema principal
// ---------------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // Precio de venta — requerido siempre que esté activo
    // -----------------------------------------------------------------------
    precioVenta: Yup.number().when("activo", {
        is: true,
        then: (schema) =>
            schema
                .required("El precio de venta es requerido para productos activos")
                .positive("El precio de venta debe ser mayor a cero")
                .min(0.01, "El precio de venta debe ser mayor a cero")
                .test(
                    "precio-venta-mayor-o-igual-minimo",
                    "El precio de venta no puede ser menor que el precio mínimo",
                    function (value) {
                        const precioMinimo = this.parent.precioMinimo;
                        if (
                            value === undefined ||
                            value === null ||
                            precioMinimo === undefined ||
                            precioMinimo === null
                        ) {
                            return true;
                        }
                        return Number(value) >= Number(precioMinimo);
                    },
                ),
        otherwise: (schema) => schema.nullable(),
    }),

    // -----------------------------------------------------------------------
    // Precio mínimo — requerido siempre que esté activo
    // -----------------------------------------------------------------------
    precioMinimo: Yup.number().when("activo", {
        is: true,
        then: (schema) =>
            schema
                .required("El precio mínimo es requerido para productos activos")
                .positive("El precio mínimo debe ser mayor a cero")
                .min(0.01, "El precio mínimo debe ser mayor a cero")
                .test(
                    "precio-minimo-menor-o-igual-venta",
                    "El precio mínimo no puede ser mayor que el precio de venta",
                    function (value) {
                        const precioVenta = this.parent.precioVenta;
                        if (
                            value === undefined ||
                            value === null ||
                            precioVenta === undefined ||
                            precioVenta === null
                        ) {
                            return true;
                        }
                        return Number(value) <= Number(precioVenta);
                    },
                ),
        otherwise: (schema) => schema.nullable(),
    }),

    // -----------------------------------------------------------------------
    // Existencia — solo aplica a Productos (no Servicios)
    // -----------------------------------------------------------------------
    existencia: Yup.number()
        .nullable()
        .test(
            "existencia-solo-producto",
            "La existencia no puede ser negativa",
            function (value) {
                const ctx = this.options.context as ProductoValidationContext | undefined;
                // Servicios no tienen existencia → siempre válido
                if (ctx?.esServicio) return true;
                if (value === undefined || value === null) return true;
                return Number(value) >= 0;
            },
        ),

    // -----------------------------------------------------------------------
    // Unidades y proveedores
    //   - Producto:  al menos 1 unidad activa con al menos 1 proveedor obligatorio
    //   - Servicio:  al menos 1 unidad activa; proveedores opcionales (para registrar costo)
    // -----------------------------------------------------------------------
    unidadProductorSuplidor: Yup.array().when("activo", {
        is: true,
        then: (schema) =>
            schema
                .min(1, "Debe agregar al menos una unidad")
                .test(
                    "validar-unidades-segun-categoria",
                    "Validación de unidades fallida",
                    function (unidades) {
                        if (!unidades || unidades.length === 0) return false;

                        const ctx = this.options.context as ProductoValidationContext | undefined;
                        const esServicio = ctx?.esServicio ?? false;

                        for (let idx = 0; idx < unidades.length; idx++) {
                            const unidad = unidades[idx];

                            // Ignorar unidades inactivas
                            if (unidad.activo === false) continue;

                            if (!esServicio) {
                                // PRODUCTO: debe tener al menos un proveedor
                                const tieneProveedor =
                                    unidad.productosSuplidores && unidad.productosSuplidores.length > 0;
                                if (!tieneProveedor) {
                                    return this.createError({
                                        message: `La unidad #${idx + 1} debe tener al menos un proveedor asignado`,
                                    });
                                }
                            }

                            // SERVICIO: cantidad debe ser 1
                            if (esServicio && unidad.cantidad !== undefined && Number(unidad.cantidad) !== 1) {
                                return this.createError({
                                    message: `La cantidad en servicios debe ser 1 (unidad #${idx + 1})`,
                                });
                            }
                        }

                        return true;
                    },
                ),
        otherwise: (schema) => schema.nullable(),
    }),

    // -----------------------------------------------------------------------
    // Límites por almacén — no puede repetirse el mismo almacén
    // -----------------------------------------------------------------------
    productosAlmacenesLimites: Yup.array()
        .nullable()
        .test(
            "almacen-unico",
            "No puede haber dos límites para el mismo almacén",
            function (limites) {
                if (!limites || limites.length === 0) return true;

                // almacenId puede llegar como número, string o {id, nombre}
                const getId = (almacenId: any): string | null => {
                    if (almacenId === null || almacenId === undefined) return null;
                    if (typeof almacenId === "object" && almacenId.id !== undefined) {
                        return String(almacenId.id);
                    }
                    return String(almacenId);
                };

                const seen = new Set<string>();
                for (let i = 0; i < limites.length; i++) {
                    const id = getId((limites[i] as any).almacenId);
                    if (!id || id === "0") continue; // sin almacén seleccionado, ignorar
                    if (seen.has(id)) {
                        return this.createError({
                            message: `El almacén ya tiene un límite configurado (límite #${i + 1})`,
                        });
                    }
                    seen.add(id);
                }
                return true;
            },
        ),

    // -----------------------------------------------------------------------
    // Opcional: código de barra, descripción, precios de costo
    // -----------------------------------------------------------------------
    codigoBarra: Yup.string()
        .max(50, "El código de barra no puede exceder 50 caracteres")
        .nullable(),

    descripcion: Yup.string()
        .max(500, "La descripción no puede exceder 500 caracteres")
        .nullable(),

    precio: Yup.number()
        .min(0, "El precio de costo no puede ser negativo")
        .nullable(),

    precioCostoAvg: Yup.number()
        .min(0, "El precio de costo promedio no puede ser negativo")
        .nullable(),

    // -----------------------------------------------------------------------
    // Comisión — solo cuando trabajador = true
    // -----------------------------------------------------------------------
    comision: Yup.number().when("trabajador", {
        is: true,
        then: (schema) =>
            schema
                .required("La comisión es requerida cuando el producto es para trabajador")
                .min(0, "La comisión no puede ser negativa"),
        otherwise: (schema) => schema.nullable(),
    }),
});

// ---------------------------------------------------------------------------
// Función pública de validación
// ---------------------------------------------------------------------------
export const validateProducto = async (
    data: MgProducto,
    esServicio: boolean = false,
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    const context: ProductoValidationContext = { esServicio };

    try {
        await productoSchema.validate(data, { abortEarly: false, context });
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
