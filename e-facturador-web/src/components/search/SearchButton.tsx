import React from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { SearchConfig, SearchParams } from "../../types/modalSearchTypes";

interface SearchButtonProps {
    config: SearchConfig;
    onOpenSearch: (config: SearchConfig, initialValues?: SearchParams) => void;
    initialValues?: SearchParams;
    variant?: "button" | "icon";
    size?: "small" | "medium" | "large";
    disabled?: boolean;
    tooltip?: string;
    children?: React.ReactNode;
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
 */
export const SearchButton: React.FC<SearchButtonProps> = ({
    config,
    onOpenSearch,
    initialValues = {},
    variant = "button",
    size = "small",
    disabled = false,
    tooltip,
    children,
}) => {
    const handleClick = () => {
        onOpenSearch(config, initialValues);
    };

    if (variant === "icon") {
        const iconButton = (
            <IconButton onClick={handleClick} disabled={disabled} size={size}>
                <SearchIcon />
            </IconButton>
        );

        return tooltip ? <Tooltip title={tooltip}>{iconButton}</Tooltip> : iconButton;
    }

    return (
        <Button onClick={handleClick} disabled={disabled} size={size} variant="outlined" startIcon={<SearchIcon />}>
            {children || config.title}
        </Button>
    );
};

export default SearchButton;
