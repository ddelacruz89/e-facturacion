import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Autocomplete, TextField, Grid, CircularProgress, IconButton, Box, Chip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { Control, Controller, FieldError } from "react-hook-form";

export interface ComboBoxOption {
    value: string | number;
    label: string;
    disabled?: boolean;
    [key: string]: any; // Allow additional properties
}

export interface SearchableComboBoxProps {
    name: string;
    label: string;
    control: Control<any>;
    error?: FieldError;
    rules?: object;
    size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    placeholder?: string;
    disabled?: boolean;
    multiple?: boolean;
    freeSolo?: boolean;
    loading?: boolean;
    options: ComboBoxOption[];

    // Data fetching functions
    onRefresh?: () => Promise<void> | void;
    onSearch?: (query: string) => Promise<ComboBoxOption[]> | ComboBoxOption[];

    // Event handlers
    onSelectionChange?: (value: any) => void;
    onInputChange?: (value: string) => void;

    // Customization
    noOptionsText?: string;
    loadingText?: string;
    getOptionLabel?: (option: ComboBoxOption) => string;
    getOptionDisabled?: (option: ComboBoxOption) => boolean;

    // Display options
    showRefreshButton?: boolean;
    showSearchIcon?: boolean;
    clearOnRefresh?: boolean;
}

export const SearchableComboBox: React.FC<SearchableComboBoxProps> = ({
    name,
    label,
    control,
    error,
    rules,
    size = 12,
    placeholder,
    disabled = false,
    multiple = false,
    freeSolo = false,
    loading = false,
    options = [],
    onRefresh,
    onSearch,
    onSelectionChange,
    onInputChange,
    noOptionsText = "No hay opciones disponibles",
    loadingText = "Cargando...",
    getOptionLabel,
    getOptionDisabled,
    showRefreshButton = true,
    showSearchIcon = true,
    clearOnRefresh = false,
}) => {
    const [internalLoading, setInternalLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<ComboBoxOption[]>(options);

    // Update filtered options when options change
    useEffect(() => {
        setFilteredOptions(options);
    }, [options]);

    // Handle search functionality
    const handleSearch = useCallback(
        async (query: string) => {
            if (onSearch) {
                setInternalLoading(true);
                try {
                    const results = await onSearch(query);
                    setFilteredOptions(Array.isArray(results) ? results : options);
                } catch (error) {
                    console.error("Search error:", error);
                    setFilteredOptions([]);
                } finally {
                    setInternalLoading(false);
                }
            } else {
                // Local filtering if no search function provided
                const filtered = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
                setFilteredOptions(filtered);
            }
        },
        [onSearch, options]
    );

    // Handle input change with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery) {
                handleSearch(searchQuery);
            } else {
                setFilteredOptions(options);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, handleSearch, options]);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        if (onRefresh) {
            setInternalLoading(true);
            try {
                await onRefresh();
                if (clearOnRefresh) {
                    setSearchQuery("");
                }
            } catch (error) {
                console.error("Refresh error:", error);
            } finally {
                setInternalLoading(false);
            }
        }
    }, [onRefresh, clearOnRefresh]);

    // Determine if we should show loading state
    const isLoading = loading || internalLoading;

    // Default option label function
    const defaultGetOptionLabel = (option: ComboBoxOption | string): string => {
        if (typeof option === "string") return option;
        return getOptionLabel ? getOptionLabel(option) : option.label;
    };

    // Memoized filtered options for performance
    const memoizedOptions = useMemo(() => filteredOptions, [filteredOptions]);

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, ...field } }) => {
                // Convert stored value back to option object for Autocomplete
                const getDisplayValue = () => {
                    if (!value) return multiple ? [] : null;

                    if (multiple) {
                        if (Array.isArray(value)) {
                            return value.map((v) => {
                                // Handle both new format {id, nombre} and old format
                                const searchValue = typeof v === "object" && v?.id !== undefined ? v.id : v;
                                return memoizedOptions.find((opt) => opt.value === searchValue) || v;
                            });
                        }
                        return [];
                    } else {
                        // Handle both new format {id, nombre} and old format
                        const searchValue = typeof value === "object" && value?.id !== undefined ? value.id : value;
                        return memoizedOptions.find((opt) => opt.value === searchValue) || null;
                    }
                };

                return (
                    <Grid size={{ xs: 12, sm: size }}>
                        <Autocomplete
                            {...field}
                            options={memoizedOptions}
                            value={getDisplayValue()}
                            onChange={(_, newValue) => {
                                // Store both ID and nombre information
                                let valueToSet;
                                if (multiple) {
                                    // Handle multiple selection
                                    if (Array.isArray(newValue)) {
                                        valueToSet = newValue.map((item: any) => {
                                            if (typeof item === "object" && item?.value !== undefined) {
                                                return {
                                                    id: item.value,
                                                    nombre: item.label, // Changed from 'name' to 'nombre'
                                                    // Removed description
                                                };
                                            }
                                            return item;
                                        });
                                    } else {
                                        valueToSet = [];
                                    }
                                } else {
                                    // Handle single selection - cast to ComboBoxOption to fix typing
                                    const singleValue = newValue as ComboBoxOption | null;
                                    if (singleValue && typeof singleValue === "object" && "value" in singleValue) {
                                        valueToSet = {
                                            id: singleValue.value,
                                            nombre: singleValue.label, // Changed from 'name' to 'nombre'
                                            // Removed description
                                        };
                                    } else {
                                        valueToSet = newValue;
                                    }
                                }
                                onChange(valueToSet);
                                onSelectionChange?.(newValue);
                            }}
                            onInputChange={(_, newInputValue) => {
                                setSearchQuery(newInputValue);
                                onInputChange?.(newInputValue);
                            }}
                            getOptionLabel={defaultGetOptionLabel}
                            getOptionDisabled={getOptionDisabled}
                            loading={isLoading}
                            disabled={disabled}
                            multiple={multiple}
                            freeSolo={freeSolo}
                            noOptionsText={noOptionsText}
                            loadingText={loadingText}
                            isOptionEqualToValue={(option, value) => {
                                if (typeof option === "string" && typeof value === "string") {
                                    return option === value;
                                }
                                return option.value === value?.value;
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={label}
                                    placeholder={placeholder}
                                    error={!!error}
                                    helperText={error?.message}
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                {showSearchIcon && (
                                                    <SearchIcon sx={{ color: "action.active", mr: 0.5, fontSize: 20 }} />
                                                )}
                                                {params.InputProps.startAdornment}
                                            </Box>
                                        ),
                                        endAdornment: (
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                {params.InputProps.endAdornment}
                                                {isLoading && <CircularProgress color="inherit" size={16} sx={{ ml: 1 }} />}
                                                {showRefreshButton && onRefresh && (
                                                    <IconButton
                                                        onClick={handleRefresh}
                                                        disabled={isLoading || disabled}
                                                        size="small"
                                                        color="primary"
                                                        title="Actualizar datos"
                                                        sx={{ ml: 0.5, p: 0.5 }}>
                                                        <RefreshIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2">{defaultGetOptionLabel(option)}</Typography>
                                        {option.description && (
                                            <Typography variant="caption" color="text.secondary">
                                                {option.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={defaultGetOptionLabel(option)}
                                        size="small"
                                        {...getTagProps({ index })}
                                        key={option.value || index}
                                    />
                                ))
                            }
                        />
                    </Grid>
                );
            }}
        />
    );
};

export default SearchableComboBox;
