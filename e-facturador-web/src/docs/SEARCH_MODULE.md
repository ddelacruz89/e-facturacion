# Reusable Search Module

A comprehensive and flexible search module for making GET requests with parameters. This module provides a clean, reusable interface for searching across different entities in your application.

## Features

-   ✅ **Generic Search Service**: Works with any GET endpoint and parameters
-   ✅ **TypeScript Support**: Fully typed with generic interfaces
-   ✅ **Utility Functions**: Pre-built functions for common search patterns
-   ✅ **Debouncing Support**: Built-in debouncing for search-as-you-type
-   ✅ **Parameter Cleaning**: Automatically removes empty/null parameters
-   ✅ **Error Handling**: Consistent error handling across all searches
-   ✅ **Flexible Configuration**: Custom headers, timeouts, and more

## Files Created

-   `src/services/searchService.ts` - Main search service
-   `src/utils/searchUtils.ts` - Utility functions for common patterns
-   `src/types/searchTypes.ts` - TypeScript interfaces for type safety
-   `src/examples/SearchExampleComponent.tsx` - Example React component

## Basic Usage

### 1. Import the Search Service

```typescript
import searchService from "../services/searchService";
import { searchByQuery, searchById, getAll } from "../utils/searchUtils";
```

### 2. Simple Search

```typescript
// Basic search with query parameter
const productos = await searchService.search<MgProducto[]>({
    url: "/api/producto/producto/search",
    params: { q: "laptop" },
});
```

### 3. Using Utility Functions

```typescript
// Search by query
const results = await searchByQuery<MgProducto[]>("/api/producto/search", "laptop");

// Get by ID
const producto = await searchById<MgProducto>("/api/producto/producto", 123);

// Get all items
const allProductos = await getAll<MgProducto[]>("/api/producto/producto");
```

## Advanced Usage

### 1. Search with Multiple Parameters

```typescript
const results = await searchService.search<MgProducto[]>({
    url: "/api/producto/producto/search/advanced",
    params: {
        q: "laptop",
        categoria: "electronics",
        precio_min: 100,
        precio_max: 1000,
        estado: "activo",
        page: 0,
        size: 10,
    },
});
```

### 2. Create Reusable Search Functions

```typescript
// Create a specialized search function
const searchProductos = searchService.createSearchFunction<MgProducto[]>(
    "/api/producto/producto/search",
    { estado: "activo" } // Default parameters
);

// Use it
const laptops = await searchProductos({ q: "laptop" });
const phones = await searchProductos({ q: "phone", categoria: "mobile" });
```

### 3. Debounced Search for Real-time Search

```typescript
import { createDebouncedSearch } from "../utils/searchUtils";

const debouncedProductSearch = createDebouncedSearch(
    (query: string) =>
        searchService.search<MgProducto[]>({
            url: "/api/producto/producto/search",
            params: { q: query },
        }),
    300 // 300ms delay
);

// Use in input handler
const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (query.length > 2) {
        debouncedProductSearch(query).then(setProducts).catch(console.error);
    }
};
```

### 4. Pagination and Filtering

```typescript
import { searchWithPagination, searchWithFilters } from "../utils/searchUtils";

// Paginated search
const paginatedResults = await searchWithPagination<{
    content: MgProducto[];
    totalElements: number;
    totalPages: number;
}>(
    "/api/producto/producto/paginated",
    0, // page
    10, // size
    { categoria: "electronics" } // additional filters
);

// Complex filtering
const filteredResults = await searchWithFilters<MgProducto[]>("/api/producto/producto/filter", {
    categoria: "electronics",
    precio_min: 100,
    precio_max: 500,
    disponible: true,
    suplidor: "ACME Corp",
});
```

## Updating Existing Controllers

Here's how to update your existing API controllers to use the new search service:

### Before (Old Way)

```typescript
export function searchProductos(query: string): Promise<MgProducto[]> {
    return apiClient.get(`${api}/search?q=${encodeURIComponent(query)}`).then((x: { data: MgProducto[] }) => x.data);
}
```

### After (New Way)

```typescript
import { searchByQuery } from "../utils/searchUtils";

export function searchProductos(query: string): Promise<MgProducto[]> {
    return searchByQuery<MgProducto[]>(`${api}/search`, query);
}

// Or for more control
export function searchProductosAdvanced(filters: ProductoSearchParams): Promise<MgProducto[]> {
    return searchService.search<MgProducto[]>({
        url: `${api}/search/advanced`,
        params: filters,
    });
}
```

## Type Safety

Use the provided TypeScript interfaces for better type safety:

```typescript
import { ProductoSearchParams, PaginatedResponse } from "../types/searchTypes";

export function searchProductosTyped(params: ProductoSearchParams): Promise<PaginatedResponse<MgProducto>> {
    return searchService.search({
        url: "/api/producto/producto/search",
        params,
    });
}
```

## Error Handling

The search service includes built-in error handling, but you can add custom error handling:

```typescript
try {
    const results = await searchService.search<MgProducto[]>({
        url: "/api/producto/producto/search",
        params: { q: "laptop" },
    });

    setProducts(results);
} catch (error) {
    console.error("Search failed:", error);
    setError("Failed to search products");
}
```

## Configuration Options

### Custom Headers

```typescript
const results = await searchService.search<MgProducto[]>({
    url: "/api/producto/producto/search",
    params: { q: "laptop" },
    headers: {
        "X-Custom-Header": "custom-value",
        "Accept-Language": "es-ES",
    },
});
```

### Custom Timeout

```typescript
const results = await searchService.search<MgProducto[]>({
    url: "/api/producto/producto/search",
    params: { q: "laptop" },
    timeout: 5000, // 5 seconds
});
```

## Benefits

1. **Consistency**: All search operations use the same interface
2. **Reusability**: Create specialized search functions once, use everywhere
3. **Type Safety**: Full TypeScript support with generic types
4. **Performance**: Built-in parameter cleaning and debouncing
5. **Maintainability**: Centralized search logic, easier to modify
6. **Flexibility**: Works with any GET endpoint and parameter structure

## Migration Guide

To migrate existing search functions:

1. Replace direct `apiClient.get()` calls with `searchService.search()`
2. Use utility functions for common patterns
3. Add TypeScript interfaces for your specific search parameters
4. Consider using `createSearchFunction()` for frequently used searches

This search module will make your API calls more consistent, maintainable, and type-safe while providing powerful features like debouncing and parameter cleaning out of the box.
