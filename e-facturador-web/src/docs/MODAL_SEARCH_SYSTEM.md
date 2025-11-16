# Modal Search System

Un sistema de búsqueda modal reutilizable y parametrizable que permite realizar búsquedas complejas con diferentes criterios según la entidad.

## Componentes del Sistema

### 1. **ModalSearch** - Componente principal del modal

### 2. **SearchButton** - Botón reutilizable para abrir búsquedas

### 3. **useModalSearch** - Hook para manejar el estado del modal

### 4. **SEARCH_CONFIGS** - Configuraciones predefinidas para entidades

## Características

✅ **Parametrizable**: Define tipos de búsqueda específicos para cada entidad  
✅ **Reutilizable**: Mismo componente para todas las búsquedas  
✅ **Flexible**: Soporte para text, number, select, date, boolean  
✅ **TypeScript**: Completamente tipado  
✅ **Responsive**: Diseño adaptable  
✅ **Validación**: Validación de formularios integrada

## Configuración de Búsqueda

```typescript
interface SearchConfig {
    title: string; // Título del modal
    endpoint: string; // URL del API
    fields: SearchField[]; // Campos de búsqueda
    displayColumns: SearchDisplayColumn[]; // Columnas a mostrar
    keyField: string; // Campo clave (ID)
    searchOnLoad?: boolean; // Buscar al abrir
    defaultParams?: object; // Parámetros por defecto
}
```

### Tipos de Campos Disponibles

-   **text**: Campo de texto libre
-   **number**: Campo numérico
-   **select**: Lista desplegable con opciones
-   **date**: Selector de fecha
-   **boolean**: Checkbox

## Uso Básico

### 1. Importar las dependencias

```typescript
import ModalSearch from "../components/search/ModalSearch";
import SearchButton from "../components/search/SearchButton";
import useModalSearch from "../hooks/useModalSearch";
import { SEARCH_CONFIGS } from "../types/modalSearchTypes";
```

### 2. Configurar el hook

```typescript
const modalSearch = useModalSearch();

// Función para manejar la selección
const handleProductSelect = modalSearch.handleSelect((product) => {
    console.log("Producto seleccionado:", product);
    setValue("productId", product.id);
    setValue("productName", product.nombreProducto);
});
```

### 3. Agregar el botón de búsqueda

```tsx
<SearchButton
    config={SEARCH_CONFIGS.PRODUCTO}
    onOpenSearch={modalSearch.openModal}
    variant="button"
    initialValues={{ estado: "activo" }}>
    Buscar Producto
</SearchButton>
```

### 4. Agregar el modal

```tsx
{
    modalSearch.config && (
        <ModalSearch
            open={modalSearch.isOpen}
            onClose={modalSearch.closeModal}
            onSelect={handleProductSelect}
            config={modalSearch.config}
            initialValues={modalSearch.initialValues}
        />
    );
}
```

## Configuraciones Predefinidas

### PRODUCTO

-   **Campos**: ID, Nombre, Código de Barra, Categoría, Estado
-   **Endpoint**: `/api/producto/producto/search/advanced`

### SUPLIDOR

-   **Campos**: ID, Nombre, RNC, Estado
-   **Endpoint**: `/api/suplidor/search/advanced`

### CATEGORIA

-   **Campos**: ID, Nombre
-   **Endpoint**: `/api/categoria/search/advanced`

### USUARIO

-   **Campos**: ID, Nombre, Email, Estado
-   **Endpoint**: `/api/usuario/search/advanced`

## Crear Nueva Configuración

```typescript
const CUSTOM_SEARCH: SearchConfig = {
    title: "Buscar Cliente",
    endpoint: "/api/cliente/search/advanced",
    keyField: "id",
    fields: [
        {
            key: "id",
            label: "ID",
            type: "number",
            placeholder: "ID del cliente",
        },
        {
            key: "nombre",
            label: "Nombre",
            type: "text",
            placeholder: "Nombre del cliente",
        },
        {
            key: "tipo",
            label: "Tipo",
            type: "select",
            options: [
                { value: "", label: "Todos" },
                { value: "persona", label: "Persona" },
                { value: "empresa", label: "Empresa" },
            ],
        },
    ],
    displayColumns: [
        { key: "id", label: "ID", width: "10%" },
        { key: "nombre", label: "Nombre", width: "30%" },
        { key: "telefono", label: "Teléfono", width: "20%" },
        { key: "email", label: "Email", width: "40%" },
    ],
};
```

## Variantes del SearchButton

### Botón Normal

```tsx
<SearchButton config={SEARCH_CONFIGS.PRODUCTO} onOpenSearch={modalSearch.openModal} variant="button">
    Buscar Producto
</SearchButton>
```

### Botón con Icono

```tsx
<SearchButton config={SEARCH_CONFIGS.SUPLIDOR} onOpenSearch={modalSearch.openModal} variant="icon" tooltip="Buscar Suplidor" />
```

## Funcionalidades Avanzadas

### Valores Iniciales

```typescript
modalSearch.openModal(SEARCH_CONFIGS.PRODUCTO, {
    estado: "activo",
    categoria: "electronics",
});
```

### Búsqueda al Abrir Modal

```typescript
const autoSearchConfig = {
    ...SEARCH_CONFIGS.PRODUCTO,
    searchOnLoad: true,
    defaultParams: { limite: 50 },
};
```

### Columnas con Renderizado Personalizado

```typescript
displayColumns: [
    {
        key: "precio",
        label: "Precio",
        width: "15%",
        render: (value) => `RD$ ${value?.toLocaleString()}`,
    },
    {
        key: "activo",
        label: "Estado",
        width: "10%",
        render: (value) => (value ? "Activo" : "Inactivo"),
    },
];
```

## Integración con APIs

El sistema utiliza el `searchService` existente para realizar las llamadas al API. Asegúrate de que tus endpoints backend soporten los parámetros de búsqueda configurados.

### Ejemplo de Endpoint Backend

```typescript
// GET /api/producto/producto/search/advanced?id=123&q=laptop&estado=activo
```

## Beneficios

1. **Consistencia**: Misma UX en todas las búsquedas
2. **Mantenibilidad**: Un solo componente para mantener
3. **Flexibilidad**: Fácil agregar nuevos tipos de búsqueda
4. **Reutilización**: Configuraciones reutilizables
5. **TypeScript**: Seguridad de tipos completa

Este sistema reemplaza la búsqueda manual por ID con un modal completo que permite búsquedas más sofisticadas y reutilizables en toda la aplicación.
