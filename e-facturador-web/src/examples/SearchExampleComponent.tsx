import React, { useState, useEffect } from "react";
import { TextField, Box, List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import searchService from "../services/searchService";
import { createDebouncedSearch, searchWithFilters } from "../utils/searchUtils";
import { MgProducto } from "../models/producto";

// Example component showing how to use the search service
export const SearchExampleComponent: React.FC = () => {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<MgProducto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Example 1: Using the search service directly
    const searchProductsDirectly = async (searchQuery: string) => {
        try {
            setLoading(true);
            setError(null);

            const results = await searchService.search<MgProducto[]>({
                url: "/api/producto/producto/search",
                params: { q: searchQuery },
            });

            setProducts(results);
        } catch (err) {
            setError("Error searching products");
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Example 2: Using utility functions with debouncing
    const debouncedSearch = createDebouncedSearch(
        (searchQuery: string) =>
            searchService.search<MgProducto[]>({
                url: "/api/producto/producto/search",
                params: { q: searchQuery },
            }),
        300 // 300ms delay
    );

    // Example 3: Advanced search with multiple filters
    const searchWithAdvancedFilters = async () => {
        try {
            setLoading(true);
            setError(null);

            const results = await searchWithFilters<MgProducto[]>("/api/producto/producto/search/advanced", {
                q: query,
                categoria: "electronics",
                precio_min: 100,
                precio_max: 1000,
                estado: "activo",
            });

            setProducts(results);
        } catch (err) {
            setError("Error in advanced search");
        } finally {
            setLoading(false);
        }
    };

    // Example 4: Using createSearchFunction for reusable searches
    const productSearchFunction = searchService.createSearchFunction<MgProducto[]>("/api/producto/producto/search");

    const searchWithCreatedFunction = async (searchQuery: string) => {
        try {
            setLoading(true);
            const results = await productSearchFunction({ q: searchQuery });
            setProducts(results);
        } catch (err) {
            setError("Error in function search");
        } finally {
            setLoading(false);
        }
    };

    // Handle input change with debounced search
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setQuery(newQuery);

        if (newQuery.length > 2) {
            debouncedSearch(newQuery)
                .then(setProducts)
                .catch((err) => {
                    setError("Search failed");
                    console.error("Debounced search error:", err);
                });
        } else {
            setProducts([]);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <h2>Search Service Examples</h2>

            <TextField
                fullWidth
                label="Search Products"
                value={query}
                onChange={handleSearchChange}
                variant="outlined"
                margin="normal"
                placeholder="Type to search products..."
            />

            <Box sx={{ mt: 2 }}>
                <button onClick={() => searchProductsDirectly(query)}>Direct Search</button>
                <button onClick={searchWithAdvancedFilters} style={{ marginLeft: 8 }}>
                    Advanced Search
                </button>
                <button onClick={() => searchWithCreatedFunction(query)} style={{ marginLeft: 8 }}>
                    Function Search
                </button>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Box sx={{ color: "red", mt: 2 }}>{error}</Box>}

            <List>
                {products.map((product) => (
                    <ListItem key={product.id}>
                        <ListItemText
                            primary={product.nombreProducto || "Product"}
                            secondary={`ID: ${product.id} - ${product.descripcion || "No description"}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default SearchExampleComponent;
