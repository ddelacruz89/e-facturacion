import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Box,
    CircularProgress,
    Typography,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useForm, Controller } from "react-hook-form";
import searchService from "../../services/searchService";
import { ModalSearchProps, SearchField, SearchResultItem, SearchParams } from "../../types/modalSearchTypes";

export const ModalSearch: React.FC<ModalSearchProps> = ({ open, onClose, onSelect, config, initialValues = {} }) => {
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);

    const { control, handleSubmit, reset, watch, setValue } = useForm<SearchParams>({
        defaultValues: initialValues,
    });

    // Auto-search on load if configured
    useEffect(() => {
        if (open && config.searchOnLoad) {
            performSearch(initialValues);
        }
    }, [open, config.searchOnLoad]);

    // Perform search with given parameters
    const performSearch = async (searchParams: SearchParams = {}) => {
        try {
            setLoading(true);
            setError(null);
            setSelectedItem(null);

            // Clean empty parameters
            const cleanParams = Object.entries(searchParams).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    acc[key] = value;
                }
                return acc;
            }, {} as SearchParams);

            // Add default parameters
            const finalParams = {
                ...config.defaultParams,
                ...cleanParams,
            };

            // If no parameters, don't search unless it's configured to search on load
            if (Object.keys(finalParams).length === 0 && !config.searchOnLoad) {
                setResults([]);
                return;
            }

            const searchResults = await searchService.search<SearchResultItem[]>({
                url: config.endpoint,
                params: finalParams,
            });

            setResults(Array.isArray(searchResults) ? searchResults : []);
        } catch (err) {
            console.error("Modal search error:", err);
            setError("Error al realizar la búsqueda. Verifique los criterios e intente nuevamente.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const onSubmit = (data: SearchParams) => {
        performSearch(data);
    };

    // Handle item selection
    const handleItemSelect = (item: SearchResultItem) => {
        setSelectedItem(item);
    };

    // Handle confirm selection
    const handleConfirmSelection = () => {
        if (selectedItem) {
            onSelect(selectedItem);
            handleClose();
        }
    };

    // Handle close
    const handleClose = () => {
        setSelectedItem(null);
        setResults([]);
        setError(null);
        reset();
        onClose();
    };

    // Clear form
    const handleClearForm = () => {
        reset();
        setResults([]);
        setError(null);
        setSelectedItem(null);
    };

    // Render form field based on type
    const renderField = (field: SearchField) => {
        const commonProps = {
            size: "small" as const,
            fullWidth: true,
            label: field.label,
            placeholder: field.placeholder,
        };

        switch (field.type) {
            case "select":
                return (
                    <FormControl {...commonProps}>
                        <InputLabel>{field.label}</InputLabel>
                        <Controller
                            name={field.key}
                            control={control}
                            render={({ field: formField }) => (
                                <Select {...formField} label={field.label} size="small">
                                    {field.options?.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                );

            case "boolean":
                return (
                    <Controller
                        name={field.key}
                        control={control}
                        render={({ field: formField }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!formField.value}
                                        onChange={(e) => formField.onChange(e.target.checked)}
                                    />
                                }
                                label={field.label}
                            />
                        )}
                    />
                );

            case "number":
                return (
                    <Controller
                        name={field.key}
                        control={control}
                        render={({ field: formField }) => (
                            <TextField
                                {...formField}
                                {...commonProps}
                                type="number"
                                inputProps={{
                                    min: field.validation?.min,
                                    max: field.validation?.max,
                                }}
                            />
                        )}
                    />
                );

            case "date":
                return (
                    <Controller
                        name={field.key}
                        control={control}
                        render={({ field: formField }) => (
                            <TextField {...formField} {...commonProps} type="date" InputLabelProps={{ shrink: true }} />
                        )}
                    />
                );

            default: // 'text'
                return (
                    <Controller
                        name={field.key}
                        control={control}
                        render={({ field: formField }) => <TextField {...formField} {...commonProps} type="text" />}
                    />
                );
        }
    };

    // Render table cell value
    const renderCellValue = (column: any, item: SearchResultItem) => {
        const value = item[column.key];

        if (column.render) {
            return column.render(value, item);
        }

        if (value === null || value === undefined) {
            return "-";
        }

        if (typeof value === "boolean") {
            return value ? "Sí" : "No";
        }

        return String(value);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { height: "80vh" },
            }}>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{config.title}</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {/* Search Form */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)} mb={2}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                        {config.fields.map((field, index) => (
                            <Box key={field.key} sx={{ minWidth: 200, flex: "1 1 300px" }}>
                                {renderField(field)}
                            </Box>
                        ))}
                        <Box sx={{ minWidth: 200, flex: "1 1 300px" }}>
                            <Box display="flex" gap={1}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SearchIcon />}
                                    disabled={loading}
                                    size="small">
                                    Buscar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<ClearIcon />}
                                    onClick={handleClearForm}
                                    size="small">
                                    Limpiar
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <Box display="flex" justifyContent="center" py={3}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Results Table */}
                {!loading && results.length > 0 && (
                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">Seleccionar</TableCell>
                                    {config.displayColumns.map((column) => (
                                        <TableCell key={column.key} style={{ width: column.width }}>
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((item, index) => {
                                    const isSelected: boolean = !!(
                                        selectedItem && selectedItem[config.keyField] === item[config.keyField]
                                    );
                                    return (
                                        <TableRow
                                            key={item[config.keyField] || index}
                                            hover
                                            selected={isSelected}
                                            onClick={() => handleItemSelect(item)}
                                            style={{ cursor: "pointer" }}>
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            {config.displayColumns.map((column) => (
                                                <TableCell key={column.key}>{renderCellValue(column, item)}</TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* No Results */}
                {!loading && results.length === 0 && !error && (
                    <Box py={3} textAlign="center">
                        <Typography variant="body1" color="textSecondary">
                            {config.searchOnLoad
                                ? "No se encontraron resultados"
                                : "Ingrese criterios de búsqueda y haga clic en 'Buscar'"}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancelar
                </Button>
                <Button onClick={handleConfirmSelection} color="primary" variant="contained" disabled={!selectedItem}>
                    Seleccionar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalSearch;
