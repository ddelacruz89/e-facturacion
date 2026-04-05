/**
 * Types and interfaces for the modal search component
 */

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

const formatDateTimeForUi = (value: any): string => {
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
    PRODUCTO: {
        title: "Buscar Producto",
        endpoint: "/api/producto/search/advanced",
        keyField: "id",
        fields: [
            {
                key: "id",
                label: "ID",
                type: "number" as const,
                placeholder: "Ingrese ID del producto"
            },
            {
                key: "nombreProducto",
                label: "Nombre",
                type: "text" as const,
                placeholder: "Ingrese nombre del producto"
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "10%" },
            { key: "nombreProducto", label: "Nombre", width: "30%" },
            { key: "codigoBarra", label: "Código", width: "20%" },
            { key: "descripcion", label: "Descripción", width: "40%" }
        ]
    } as SearchConfig,

    SUPLIDOR: {
        title: "Buscar Suplidor",
        endpoint: "/api/suplidor/search/advanced",
        keyField: "id",
        fields: [
            {
                key: "id",
                label: "ID",
                type: "number" as const,
                placeholder: "Ingrese ID del suplidor"
            },
            {
                key: "q",
                label: "Nombre",
                type: "text" as const,
                placeholder: "Ingrese nombre del suplidor"
            },
            {
                key: "rnc",
                label: "RNC",
                type: "text" as const,
                placeholder: "Ingrese RNC"
            },
            {
                key: "activo",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "true", label: "Activo" },
                    { value: "false", label: "Inactivo" }
                ]
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "10%" },
            { key: "nombre", label: "Nombre", width: "30%" },
            { key: "rnc", label: "RNC", width: "20%" },
            { key: "telefono", label: "Teléfono", width: "20%" },
            { key: "email", label: "Email", width: "20%" }
        ]
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
        endpoint: "/api/usuario/search/advanced",
        keyField: "id",
        fields: [
            {
                key: "id",
                label: "ID",
                type: "number" as const,
                placeholder: "Ingrese ID del usuario"
            },
            {
                key: "q",
                label: "Nombre",
                type: "text" as const,
                placeholder: "Ingrese nombre del usuario"
            },
            {
                key: "email",
                label: "Email",
                type: "text" as const,
                placeholder: "Ingrese email"
            },
            {
                key: "activo",
                label: "Estado",
                type: "select" as const,
                options: [
                    { value: "", label: "Todos" },
                    { value: "true", label: "Activo" },
                    { value: "false", label: "Inactivo" }
                ]
            }
        ],
        displayColumns: [
            { key: "id", label: "ID", width: "10%" },
            { key: "nombre", label: "Nombre", width: "25%" },
            { key: "email", label: "Email", width: "30%" },
            { key: "role", label: "Rol", width: "20%" },
            { key: "activo", label: "Estado", width: "15%" }
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
            { key: "id", label: "ID", width: "10%" },
            {
                key: "fechaReg",
                label: "Fecha",
                width: "20%",
                render: (value: any) => formatDateTimeForUi(value),
            },
            { key: "suplidorNombre", label: "Suplidor", width: "30%" },
            {
                key: "total",
                label: "Total",
                width: "20%",
                render: (value: any) => formatTotal16_2(value),
            },
            {
                key: "estadoId",
                label: "Estado",
                width: "20%",
                render: (value: any) => formatEstadoOrdenCompra(value),
            }
        ]
    } as SearchConfig
};

export default SEARCH_CONFIGS;