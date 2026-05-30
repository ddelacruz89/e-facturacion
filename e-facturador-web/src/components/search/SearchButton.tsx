import React from "react";
import { Button, IconButton, Tooltip, TextField, InputAdornment, SxProps, Theme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { SearchConfig, SearchParams } from "../../types/modalSearchTypes";

interface SearchButtonProps {
    config: SearchConfig;
    onOpenSearch: (config: SearchConfig, initialValues?: SearchParams) => void;
    initialValues?: SearchParams;
    variant?: "button" | "icon" | "input";
    buttonVariant?: "contained" | "outlined" | "text";
    size?: "small" | "medium";
    disabled?: boolean;
    tooltip?: string;
    children?: React.ReactNode;
    sx?: SxProps<Theme>;
    // New props for input variant
    displayValue?: string | number;
    placeholder?: string;
    label?: string;
    readOnly?: boolean;
}

/**
 * Reusable search button component
 *
 * @example
 * // Button variant
 * <SearchButton
 *   config={SEARCH_CONFIGS.PRODUCTO}
 *   onOpenSearch={modalSearch.openModal}
 *   variant="button"
 * >
 *   Buscar Producto
 * </SearchButton>
 *
 * @example
 * // Icon variant with tooltip
 * <SearchButton
 *   config={SEARCH_CONFIGS.SUPLIDOR}
 *   onOpenSearch={modalSearch.openModal}
 *   variant="icon"
 *   tooltip="Buscar Suplidor"
 *   initialValues={{ activo: 'true' }}
 * />
 *
 * @example
 * // Input variant with display value
 * <SearchButton
 *   config={SEARCH_CONFIGS.PRODUCTO}
 *   onOpenSearch={modalSearch.openModal}
 *   variant="input"
 *   label="Producto"
 *   displayValue={selectedProduct?.nombreProducto || ''}
 *   placeholder="Seleccione un producto..."
 * />
 */
export const SearchButton: React.FC<SearchButtonProps> = ({
    config,
    onOpenSearch,
    initialValues = {},
    variant = "button",
    buttonVariant = "outlined",
    size = "small",
    disabled = false,
    tooltip,
    children,
    sx,
    displayValue = "",
    placeholder = "Seleccione...",
    label,
    readOnly = true,
}) => {
    const handleClick = () => {
        onOpenSearch(config, initialValues);
    };

    if (variant === "input") {
        return (
            <TextField
                label={label}
                value={displayValue}
                placeholder={placeholder}
                variant="outlined"
                size={size}
                fullWidth
                disabled={disabled}
                onClick={!disabled ? handleClick : undefined}
                InputProps={{
                    readOnly: readOnly,
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton onClick={handleClick} disabled={disabled} size="small" edge="start">
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                    style: { cursor: !disabled ? "pointer" : "default" },
                }}
                sx={{
                    "& .MuiInputBase-input": {
                        cursor: !disabled ? "pointer" : "default",
                    },
                }}
            />
        );
    }

    if (variant === "icon") {
        const iconButton = (
            <IconButton onClick={handleClick} disabled={disabled} size={size}>
                <SearchIcon />
            </IconButton>
        );

        return tooltip ? <Tooltip title={tooltip}>{iconButton}</Tooltip> : iconButton;
    }

    return (
        <Button onClick={handleClick} disabled={disabled} size={size} variant={buttonVariant} startIcon={<SearchIcon />} sx={sx}>
            {children || config.title}
        </Button>
    );
};

export default SearchButton;
