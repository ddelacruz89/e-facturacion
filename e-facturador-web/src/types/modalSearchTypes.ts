/**
 * Types and interfaces for the modal search component
 */
import React from "react";

// Base search field configuration
export interface SearchField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'boolean' | 'multiselect';
    placeholder?: string;
    required?: boolean;
    options?: { value: any; label: string }[]; // For select type
    validation?: {
        min?: number;
        max?: number;
        pattern?: RegExp;
        message?: string;
    };
}

// Search configuration for an entity
export interface SearchConfig {
    title: string;
    endpoint: string;
    method?: 'GET' | 'POST'; // HTTP method, default GET
    fields: SearchField[];
    displayColumns: SearchDisplayColumn[];
    keyField: string; // Field to use as unique identifier
    searchOnLoad?: boolean; // Whether to search immediately when modal opens
    defaultParams?: { [key: string]: any }; // Default parameters to include in searches
    pagination?: {
        enabled: boolean;
        pageSize?: number;
    };
}

// Column configuration for results display
export interface SearchDisplayColumn {
    key: string;
    label: string;
    width?: string;
    render?: (value: any, item: any) => React.ReactNode;
}

// Search result item (generic)
export interface SearchResultItem {
    [key: string]: any;
}

// Search parameters built from form
export interface SearchParams {
    [key: string]: any;
}

// Modal search props
export interface ModalSearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (item: SearchResultItem) => void;
    config: SearchConfig;
    initialValues?: SearchParams;
}

const pad2 = (value: number): string => String(value).padStart(2, "0");

const to12Hour = (hour24: number): { hour12: number; meridian: "AM" | "PM" } => {
    const meridian: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return { hour12, meridian };
};

export const formatDateTimeForUi = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "string") {
        const amPmMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
        if (amPmMatch) {
            const day = Number(amPmMatch[1]);
            const month = Number(amPmMatch[2]);
            const year = Number(amPmMatch[3]);
            const hour = Number(amPmMatch[4]);
            const minute = Number(amPmMatch[5]);
            const second = Number(amPmMatch[6] || 0);
            const amPm = amPmMatch[7].toUpperCase();

            return `${year}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(minute)}:${pad2(second)} ${amPm}`;
        }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const { hour12, meridian } = to12Hour(date.getHours());

    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(hour12)}:${pad2(
        date.getMinutes(),
    )}:${pad2(date.getSeconds())} ${meridian}`;
};

const formatTotal16_2 = (value: any): string => {
    if (value === null || value === undefined || value === "") return "0.00";

    const numeric = Number(value);
    if (Number.isNaN(numeric)) return String(value);

    const absoluteIntegerLength = Math.trunc(Math.abs(numeric)).toString().length;
    if (absoluteIntegerLength > 16) {
        return numeric.toFixed(2);
    }

    return numeric.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const formatEstadoOrdenCompra = (value: any): string => {
    const estadoMap: Record<string, string> = {
        PEN: "Pendiente",
        ACT: "Activo",
        COM: "Completado",
        CAN: "Cancelado",
    };

    return estadoMap[String(value)] || String(value || "-");
};

// Pre-defined search configurations for common entities
export const SEARCH_CONFIGS = {
    ROL: {
        title: "Buscar Rol",
        endpoint: "/api/v1/seguridad/rol/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        defaultParams: {
            fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            fechaFin: new Date().toISOString().split("T")[0],
        },
        fields: [
            { key: "nombre", label: "Nombre", type: "text" as const, placeholder: "Nombre del rol" },
            { key: "fechaInicio", label: "Fecha inicio", type: "date" as const },
            { key: "fechaFin", label: "Fecha fin", type: "date" as const },
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "7%" },
            { key: "nombre", label: "Nombre", width: "25%" },
            { key: "descripcion", label: "Descripción", width: "30%" },
            { key: "cantidadPermisos", label: "Permisos", width: "12%" },
            { key: "cantidadUsuarios", label: "Usuarios", width: "12%" },
            { key: "usuarioReg", label: "Creado por", width: "10%" },
            { key: "activo", label: "Estado", width: "8%", render: (v: any) => (v ? "Activo" : "Inactivo") },
        ],
    } as SearchConfig,

    PAQUETE: {
        title: "Buscar Paquete",
        endpoint: "/api/v1/producto/paquete/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        fields: [
            {
                key: "nombre",
                label: "Nombre",
                type: "text" as const,
                placeholder: "Nombre del paquete",
            },
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "8%" },
            {
                key: "fechaReg",
                label: "Fecha",
                width: "20%",
                render: (v: any) => formatDateTimeForUi(v),
            },
            { key: "nombre", label: "Nombre", width: "32%" },
            {
                key: "precioVenta",
                label: "Precio",
                width: "14%",
                render: (v: any) => formatTotal16_2(v),
            },
            { key: "cantidadItems", label: "Ítems", width: "10%" },
            { key: "usuarioReg", label: "Usuario", width: "10%" },
            {
                key: "activo",
                label: "Estado",
                width: "6%",
                render: (v: any) => (v ? "Activo" : "Inactivo"),
            },
        ],
    } as SearchConfig,

    PRODUCTO: {
        title: "Buscar Producto",
        endpoint: "/api/producto/search/advanced",
        keyField: "id",
        searchOnLoad: true,
        pagination: { enabled: true, pageSize: 30 },
        fields: [
            { key: "id", label: "ID", type: "number" as const, placeholder: "Ingrese ID del producto" },
            { key: "nombreProducto", label: "Nombre", type: "text" as const, placeholder: "Ingrese nombre del producto" }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "10%" },
            { key: "nombreProducto", label: "Nombre", width: "30%" },
            { key: "codigoBarra", label: "Código", width: "20%" },
            { key: "descripcion", label: "Descripción", width: "40%" }
        ]
    } as SearchConfig,

    /** Búsqueda de productos de categoría Producto (categoriaId = 5) */
    PRODUCTO_VENTA: {
        title: "Buscar Producto",
        endpoint: "/api/producto/search/advanced",
        keyField: "id",
        searchOnLoad: true,
        defaultParams: { categoriaId: 5 },
        pagination: { enabled: true, pageSize: 30 },
        fields: [
            { key: "id", label: "ID", type: "number" as const, placeholder: "Ingrese ID del producto" },
            { key: "nombreProducto", label: "Nombre", type: "text" as const, placeholder: "Ingrese nombre del producto" }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "10%" },
            { key: "nombreProducto", label: "Nombre", width: "30%" },
            { key: "codigoBarra", label: "Código", width: "20%" },
            { key: "descripcion", label: "Descripción", width: "40%" }
        ]
    } as SearchConfig,

    /** Búsqueda de productos de categoría Servicio (categoriaId = 1) — para Orden de Entrada */
    PRODUCTO_SERVICIO: {
        title: "Buscar Servicio",
        endpoint: "/api/producto/search/advanced",
        keyField: "id",
        searchOnLoad: true,
        defaultParams: { categoriaId: 1 },
        pagination: { enabled: true, pageSize: 30 },
        fields: [
            { key: "id", label: "ID", type: "number" as const, placeholder: "Ingrese ID" },
            { key: "nombreProducto", label: "Nombre", type: "text" as const, placeholder: "Ingrese nombre del servicio" }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "10%" },
            { key: "nombreProducto", label: "Nombre", width: "90%" }
        ]
    } as SearchConfig,

    /** Búsqueda de productos disponibles en compra — para Orden de Compra y Cotización */
    PRODUCTO_COMPRA: {
        title: "Buscar Producto (Compra)",
        endpoint: "/api/producto/search/advanced/compra",
        keyField: "id",
        searchOnLoad: true,
        pagination: { enabled: true, pageSize: 30 },
        fields: [
            { key: "id", label: "ID", type: "number" as const, placeholder: "Ingrese ID del producto" },
            { key: "nombreProducto", label: "Nombre", type: "text" as const, placeholder: "Ingrese nombre del producto" },
            { key: "codigoBarra", label: "Código de Barra", type: "text" as const, placeholder: "Ingrese código de barra" }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "10%" },
            { key: "nombreProducto", label: "Nombre", width: "90%" }
        ]
    } as SearchConfig,

    SUPLIDOR: {
        title: "Buscar Suplidor",
        endpoint: "/api/v1/inventario/suplidores/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: {
            enabled: true,
            pageSize: 10,
        },
        fields: [
            {
                key: "nombre",
                label: "Nombre",
                type: "text" as const,
                placeholder: "Nombre del suplidor",
            },
            {
                key: "rnc",
                label: "RNC",
                type: "text" as const,
                placeholder: "RNC",
            },
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "7%" },
            { key: "nombre", label: "Nombre", width: "38%" },
            { key: "rnc", label: "RNC", width: "20%" },
            { key: "telefono1", label: "Teléfono", width: "20%" },
            {
                key: "activo",
                label: "Estado",
                width: "15%",
                render: (v: any) => (v ? "Activo" : "Inactivo"),
            },
        ],
    } as SearchConfig,

    CATEGORIA: {
        title: "Buscar Categoría",
        endpoint: "/api/categoria/search/advanced",
        keyField: "id",
        fields: [
            {
                key: "id",
                label: "ID",
                type: "number" as const,
                placeholder: "Ingrese ID de la categoría"
            },
            {
                key: "q",
                label: "Nombre",
                type: "text" as const,
                placeholder: "Ingrese nombre de la categoría"
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "15%" },
            { key: "categoria", label: "Categoría", width: "45%" },
            { key: "descripcion", label: "Descripción", width: "40%" }
        ]
    } as SearchConfig,

    USUARIO: {
        title: "Buscar Usuario",
        endpoint: "/api/v1/seguridad/usuario/buscar",
        method: "POST" as const,
        keyField: "username",
        searchOnLoad: true,
        defaultParams: { q: "" },
        fields: [
            {
                key: "q",
                label: "Usuario / Nombre",
                type: "text" as const,
                placeholder: "Buscar por username o nombre",
            },
        ],
        displayColumns: [
            { key: "username", label: "Username", width: "20%" },
            { key: "nombre", label: "Nombre", width: "35%" },
            { key: "loginEmail", label: "Email", width: "25%" },
            {
                key: "fechaReg",
                label: "Fecha Reg.",
                width: "12%",
                render: (v: any) => v ? new Date(v).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" }) : "",
            },
            { key: "estadoId", label: "Estado", width: "8%" },
        ],
    } as SearchConfig,

    ORDEN_ENTRADA: {
        title: "Buscar Orden de Entrada",
        endpoint: "/api/v1/inventario/orden-entrada/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: {
            enabled: true,
            pageSize: 10
        },
        defaultParams: (() => {
            const hoy = new Date();
            const hace30Dias = new Date();
            hace30Dias.setDate(hoy.getDate() - 30);
            return {
                fechaInicio: hace30Dias.toISOString().split('T')[0],
                fechaFin: hoy.toISOString().split('T')[0],
            };
        })(),
        fields: [
            {
                key: "fechaInicio",
                label: "Fecha Inicio",
                type: "date" as const,
                placeholder: "Seleccione fecha inicio",
            },
            {
                key: "fechaFin",
                label: "Fecha Fin",
                type: "date" as const,
                placeholder: "Seleccione fecha fin",
            },
            {
                key: "id",
                label: "ID",
                type: "number" as const,
                placeholder: "Ingrese ID de la orden"
            },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "PEN", label: "Pendiente" },
                    { value: "COM", label: "Completado" },
                    { value: "INA", label: "Anulado" }
                ]
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "8%" },
            {
                key: "fechaReg",
                label: "Fecha",
                width: "22%",
                render: (value: any) => formatDateTimeForUi(value),
            },
            { key: "almacenNombre", label: "Almacén", width: "25%" },
            {
                key: "total",
                label: "Total",
                width: "18%",
                render: (value: any) => formatTotal16_2(value),
            },
            { key: "usuarioReg", label: "Usuario", width: "15%" },
            { key: "estadoId", label: "Estado", width: "12%" },
        ]
    } as SearchConfig,

    LOTE: {
        title: "Buscar Lote",
        endpoint: "/api/v1/inventario/lotes/buscar",
        method: "POST" as const,
        keyField: "lote",
        searchOnLoad: true,
        pagination: {
            enabled: true,
            pageSize: 10
        },
        defaultParams: { estadoId: "ACT" },
        fields: [
            {
                key: "lote",
                label: "Lote",
                type: "text" as const,
                placeholder: "Código de lote"
            },
            {
                key: "productoId",
                label: "ID Producto",
                type: "number" as const,
                placeholder: "ID del producto"
            },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "ACT", label: "Activo" },
                    { value: "INA", label: "Inactivo" }
                ]
            }
        ],
        displayColumns: [
            { key: "lote", label: "Lote", width: "20%" },
            { key: "productoNombre", label: "Producto", width: "35%" },
            {
                key: "fechaVencimiento",
                label: "Vencimiento",
                width: "20%",
                render: (v: any) => v ? new Date(v).toLocaleDateString("es-DO") : "-"
            },
            { key: "usuarioReg", label: "Usuario", width: "15%" },
            { key: "estadoId", label: "Estado", width: "10%" }
        ]
    } as SearchConfig,

    ORDEN_COMPRA: {
        title: "Buscar Orden de Compra",
        endpoint: "/api/v1/inventario/ordenes-compras/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: {
            enabled: true,
            pageSize: 10
        },
        defaultParams: (() => {
            const hoy = new Date();
            const hace7Dias = new Date();
            hace7Dias.setDate(hoy.getDate() - 7);
            return {
                fechaInicio: hace7Dias.toISOString().split('T')[0],
                fechaFin: hoy.toISOString().split('T')[0],
                estadoId: "ACT"
            };
        })(),
        fields: [
            {
                key: "fechaInicio",
                label: "Fecha Inicio",
                type: "date" as const,
                placeholder: "Seleccione fecha inicio",
                required: true
            },
            {
                key: "fechaFin",
                label: "Fecha Fin",
                type: "date" as const,
                placeholder: "Seleccione fecha fin",
                required: true
            },
            {
                key: "id",
                label: "ID",
                type: "number" as const,
                placeholder: "Ingrese ID de la orden"
            },
            {
                key: "suplidorId",
                label: "Suplidor",
                type: "number" as const,
                placeholder: "ID del suplidor"
            },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "ACT", label: "Activo" },
                    { value: "PEN", label: "Pendiente" },
                    { value: "COM", label: "Completado" },
                    { value: "CAN", label: "Cancelado" }
                ]
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "8%" },
            {
                key: "fechaReg",
                label: "Fecha",
                width: "22%",
                render: (value: any) => formatDateTimeForUi(value),
            },
            { key: "suplidorNombre", label: "Suplidor", width: "30%" },
            {
                key: "total",
                label: "Total",
                width: "18%",
                render: (value: any) => formatTotal16_2(value),
            },
            {
                key: "estadoId",
                label: "Estado",
                width: "12%",
                render: (value: any) => formatEstadoOrdenCompra(value),
            }
        ]
    } as SearchConfig,

    FACTURA_SUPLIDOR: {
        title: "Buscar Factura Suplidor",
        endpoint: "/api/v1/facturacion/facturas-suplidor/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: {
            enabled: true,
            pageSize: 10
        },
        defaultParams: (() => {
            const hoy = new Date();
            const hace30Dias = new Date();
            hace30Dias.setDate(hoy.getDate() - 30);
            return {
                fechaInicio: hace30Dias.toISOString().split('T')[0],
                fechaFin: hoy.toISOString().split('T')[0],
            };
        })(),
        fields: [
            {
                key: "fechaInicio",
                label: "Fecha Inicio",
                type: "date" as const,
                placeholder: "Seleccione fecha inicio",
            },
            {
                key: "fechaFin",
                label: "Fecha Fin",
                type: "date" as const,
                placeholder: "Seleccione fecha fin",
            },
            {
                key: "numeroFactura",
                label: "No. Factura",
                type: "text" as const,
                placeholder: "Número de factura"
            },
            {
                key: "suplidorId",
                label: "Suplidor ID",
                type: "number" as const,
                placeholder: "ID del suplidor"
            },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "ACT", label: "Activo" },
                    { value: "PEN", label: "Pendiente" },
                    { value: "PAG", label: "Pagada" },
                    { value: "ANU", label: "Anulada" },
                ]
            }
        ],
        displayColumns: [
            { key: "secuencia", label: "No.", width: "7%" },
            {
                key: "fechaReg",
                label: "Fecha",
                width: "18%",
                render: (value: any) => formatDateTimeForUi(value),
            },
            { key: "suplidorNombre", label: "Suplidor", width: "22%" },
            { key: "numeroFactura", label: "No. Factura", width: "13%" },
            { key: "ncf", label: "NCF", width: "13%" },
            {
                key: "total",
                label: "Total",
                width: "13%",
                render: (value: any) => formatTotal16_2(value),
            },
            { key: "estadoId", label: "Estado", width: "8%" },
            { key: "usuarioReg", label: "Usuario", width: "6%" },
        ]
    } as SearchConfig,

    ALMACEN: {
        title: "Buscar Almacén",
        endpoint: "/api/v1/inventario/almacenes/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        defaultParams: { estadoId: "ACT" },
        fields: [
            {
                key: "nombre",
                label: "Nombre",
                type: "text" as const,
                placeholder: "Nombre del almacén"
            },
            {
                key: "sucursalId",
                label: "Sucursal ID",
                type: "number" as const,
                placeholder: "ID de sucursal"
            },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "ACT", label: "Activo" },
                    { value: "INA", label: "Inactivo" }
                ]
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "8%" },
            { key: "nombre", label: "Nombre", width: "37%" },
            { key: "sucursalNombre", label: "Sucursal", width: "40%" },
            { key: "estadoId", label: "Estado", width: "15%" }
        ]
    } as SearchConfig,

    PAGOS_SUPLIDOR: {
        title: "Buscar Pagos de Suplidor",
        endpoint: "/api/v1/facturacion/pagos-suplidor/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: {
            enabled: true,
            pageSize: 10
        },
        defaultParams: (() => {
            const hoy = new Date();
            const hace30Dias = new Date();
            hace30Dias.setDate(hoy.getDate() - 30);
            return {
                fechaInicio: hace30Dias.toISOString().split('T')[0],
                fechaFin: hoy.toISOString().split('T')[0],
            };
        })(),
        fields: [
            {
                key: "fechaInicio",
                label: "Fecha Inicio",
                type: "date" as const,
                placeholder: "Seleccione fecha inicio",
            },
            {
                key: "fechaFin",
                label: "Fecha Fin",
                type: "date" as const,
                placeholder: "Seleccione fecha fin",
            },
            {
                key: "facturaSuplidorId",
                label: "Factura Suplidor ID",
                type: "number" as const,
                placeholder: "ID de la factura",
            },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "ACT", label: "Activo" },
                    { value: "ANU", label: "Anulado" },
                ]
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "7%" },
            {
                key: "fechaPago",
                label: "Fecha Pago",
                width: "18%",
                render: (value: any) => formatDateTimeForUi(value),
            },
            { key: "facturaSuplidorId", label: "Factura ID", width: "10%" },
            { key: "suplidorNombre", label: "Suplidor", width: "25%" },
            {
                key: "monto",
                label: "Monto",
                width: "13%",
                render: (value: any) => formatTotal16_2(value),
            },
            {
                key: "pagado",
                label: "Pagado",
                width: "13%",
                render: (value: any) => formatTotal16_2(value),
            },
            { key: "estadoId", label: "Estado", width: "8%" },
            { key: "usuarioReg", label: "Usuario", width: "6%" },
        ]
    } as SearchConfig,

    REQUISICION: {
        title: "Buscar Requisición",
        endpoint: "/api/v1/inventario/requisiciones/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: {
            enabled: true,
            pageSize: 10,
        },
        defaultParams: (() => {
            const hoy = new Date();
            const hace30Dias = new Date();
            hace30Dias.setDate(hoy.getDate() - 30);
            return {
                fechaInicio: hace30Dias.toISOString().split("T")[0],
                fechaFin: hoy.toISOString().split("T")[0],
                estadoId: "PEN",
            };
        })(),
        fields: [
            {
                key: "fechaInicio",
                label: "Fecha Inicio",
                type: "date" as const,
            },
            {
                key: "fechaFin",
                label: "Fecha Fin",
                type: "date" as const,
            },
            {
                key: "prioridad",
                label: "Prioridad",
                type: "select" as const,
                options: [
                    { value: "", label: "Todas" },
                    { value: "ALTA", label: "Alta" },
                    { value: "MEDIA", label: "Media" },
                    { value: "BAJA", label: "Baja" },
                ],
            },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "PEN", label: "Pendiente" },
                    { value: "PEN_APR", label: "En Aprobación" },
                    { value: "APR", label: "Aprobada" },
                    { value: "REC", label: "Rechazada" },
                    { value: "COM", label: "Completada" },
                    { value: "ANU", label: "Anulada" },
                ],
            },
        ],
        displayColumns: [
            { key: "secuencia", label: "No.", width: "7%" },
            {
                key: "fechaReg",
                label: "Fecha",
                width: "18%",
                render: (v: any) => formatDateTimeForUi(v),
            },
            { key: "almacenSolicitanteNombre", label: "Solicitante", width: "20%" },
            { key: "almacenOrigenNombre", label: "Origen", width: "20%" },
            {
                key: "prioridad",
                label: "Prioridad",
                width: "10%",
                render: (v: any) => {
                    const colorMap: Record<string, string> = {
                        ALTA: "#71526B",
                        MEDIA: "#716752",
                        BAJA: "#527158",
                    };
                    const labelMap: Record<string, string> = { ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" };
                    return React.createElement("span", {
                        style: {
                            backgroundColor: colorMap[v] ?? "#525C71",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                        },
                    }, labelMap[v] ?? v);
                },
            },
            { key: "usuarioReg", label: "Usuario", width: "12%" },
            { key: "estadoId", label: "Estado", width: "13%" },
        ],
    } as SearchConfig,

    APROBACION: {
        title: "Buscar Aprobación",
        endpoint: "/api/v1/seguridad/aprobaciones/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: { enabled: true, pageSize: 10 },
        defaultParams: (() => {
            const hoy = new Date();
            const hace30 = new Date(); hace30.setDate(hoy.getDate() - 30);
            return {
                fechaInicio: hace30.toISOString().split("T")[0],
                fechaFin: hoy.toISOString().split("T")[0],
                estadoId: "PEN",
            };
        })(),
        fields: [
            { key: "tipoDocumento", label: "Tipo documento", type: "select" as const,
              options: [
                  { value: "", label: "Todos" },
                  { value: "REQUISICION", label: "Requisición" },
                  { value: "ORDEN_COMPRA", label: "Orden de Compra" },
                  { value: "TRANSFERENCIA", label: "Transferencia" },
              ]},
            { key: "estadoId", label: "Estado", type: "select" as const,
              options: [
                  { value: "", label: "Todos" },
                  { value: "PEN", label: "Pendiente" },
                  { value: "APR", label: "Aprobado" },
                  { value: "REC", label: "Rechazado" },
              ]},
            { key: "fechaInicio", label: "Desde", type: "date" as const },
            { key: "fechaFin",    label: "Hasta", type: "date" as const },
        ],
        displayColumns: [
            { key: "id",               label: "ID",          width: "6%" },
            { key: "tipoDocumento",    label: "Tipo",         width: "16%" },
            { key: "documentoId",      label: "Doc.",         width: "8%" },
            { key: "solicitanteNombre",label: "Solicitante",  width: "22%" },
            { key: "modoAprobacion",   label: "Modo",         width: "14%" },
            { key: "fechaSolicitud",   label: "Fecha",        width: "18%",
              render: (v: any) => formatDateTimeForUi(v) },
            { key: "estadoId",         label: "Estado",       width: "16%" },
        ],
    } as SearchConfig,

    MOVIMIENTO_TIPO: {
        title: "Buscar Tipo de Movimiento",
        endpoint: "/api/v1/inventario/movimientos-tipos/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        fields: [
            {
                key: "q",
                label: "Nombre",
                type: "text" as const,
                placeholder: "Nombre del tipo"
            },
            {
                key: "cr",
                label: "Efecto",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "true", label: "Entrada (crédito)" },
                    { value: "false", label: "Salida (débito)" }
                ]
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "8%" },
            { key: "tipoMovimiento", label: "Tipo", width: "45%" },
            {
                key: "cr",
                label: "Efecto",
                width: "22%",
                render: (v: any) => (v ? "⬆ Entrada" : "⬇ Salida")
            },
            { key: "modulo", label: "Módulo", width: "25%" }
        ]
    } as SearchConfig,

    ORDEN_DESPACHO: {
        title: "Buscar Orden de Despacho",
        endpoint: "/api/v1/despacho/ordenes/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: { enabled: true, pageSize: 10 },
        defaultParams: (() => {
            const hoy = new Date();
            const hace30 = new Date(); hace30.setDate(hoy.getDate() - 30);
            return {
                fechaInicio: hace30.toISOString().split("T")[0],
                fechaFin: hoy.toISOString().split("T")[0],
            };
        })(),
        fields: [
            { key: "fechaInicio", label: "Fecha Inicio", type: "date" as const },
            { key: "fechaFin", label: "Fecha Fin", type: "date" as const },
            { key: "clienteNombre", label: "Cliente", type: "text" as const, placeholder: "Nombre del cliente" },
            { key: "facturaSecuencia", label: "No. Factura", type: "number" as const },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "PEN", label: "Pendiente" },
                    { value: "EN_RUTA", label: "En Ruta" },
                    { value: "EN_CAMINO", label: "En Camino" },
                    { value: "ENTREGADO", label: "Entregado" },
                    { value: "DEVUELTO", label: "Devuelto" },
                    { value: "ANU", label: "Anulado" },
                ],
            },
        ],
        displayColumns: [
            { key: "secuencia", label: "No.", width: "7%" },
            { key: "fechaReg", label: "Fecha", width: "18%", render: (v: any) => formatDateTimeForUi(v) },
            { key: "facturaSecuencia", label: "Factura", width: "9%" },
            { key: "clienteNombre", label: "Cliente", width: "26%" },
            { key: "fechaCompromiso", label: "Compromiso", width: "18%", render: (v: any) => formatDateTimeForUi(v) },
            { key: "estadoId", label: "Estado", width: "12%" },
            { key: "usuarioReg", label: "Usuario", width: "10%" },
        ],
    } as SearchConfig,

    RUTA_ENTREGA: {
        title: "Buscar Ruta de Entrega",
        endpoint: "/api/v1/despacho/rutas/buscar",
        method: "POST" as const,
        keyField: "id",
        searchOnLoad: true,
        pagination: { enabled: true, pageSize: 10 },
        defaultParams: (() => {
            const hoy = new Date();
            const hace30 = new Date(); hace30.setDate(hoy.getDate() - 30);
            return {
                fechaInicio: hace30.toISOString().split("T")[0],
                fechaFin: hoy.toISOString().split("T")[0],
            };
        })(),
        fields: [
            { key: "fechaInicio", label: "Fecha Inicio", type: "date" as const },
            { key: "fechaFin", label: "Fecha Fin", type: "date" as const },
            { key: "conductorUsername", label: "Conductor", type: "text" as const, placeholder: "Usuario conductor" },
            {
                key: "estadoId",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "PLANIFICADA", label: "Planificada" },
                    { value: "EN_CURSO", label: "En Curso" },
                    { value: "COMPLETADA", label: "Completada" },
                    { value: "ANU", label: "Anulada" },
                ],
            },
        ],
        displayColumns: [
            { key: "secuencia", label: "No.", width: "7%" },
            { key: "fecha", label: "Fecha", width: "12%" },
            { key: "vehiculoDescripcion", label: "Vehículo", width: "22%" },
            { key: "vehiculoPlaca", label: "Placa", width: "10%" },
            { key: "conductorUsername", label: "Conductor", width: "18%" },
            { key: "totalOrdenes", label: "Órdenes", width: "10%" },
            { key: "estadoId", label: "Estado", width: "12%" },
            { key: "usuarioReg", label: "Creado por", width: "9%" },
        ],
    } as SearchConfig,
};

export default SEARCH_CONFIGS;