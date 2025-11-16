/**
 * Types and interfaces for the modal search component
 */

// Base search field configuration
export interface SearchField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'boolean';
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
    fields: SearchField[];
    displayColumns: SearchDisplayColumn[];
    keyField: string; // Field to use as unique identifier
    searchOnLoad?: boolean; // Whether to search immediately when modal opens
    defaultParams?: { [key: string]: any }; // Default parameters to include in searches
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
    } as SearchConfig
};

export default SEARCH_CONFIGS;