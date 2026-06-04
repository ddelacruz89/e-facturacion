import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [lastSearchParams, setLastSearchParams] = useState<SearchParams>({});

    const sentinelRef = useRef<HTMLDivElement>(null);
    const hasAutoSearchedRef = useRef(false);

    // Track mutable values needed inside the IntersectionObserver callback
    const stateRef = useRef({ hasMore: false, loading: false, loadingMore: false, currentPage: 0, lastSearchParams: {} as SearchParams });
    stateRef.current = { hasMore, loading, loadingMore, currentPage, lastSearchParams };

    const formDefaultValues = { ...config.defaultParams, ...initialValues };

    const { control, handleSubmit, reset } = useForm<SearchParams>({
        defaultValues: formDefaultValues,
    });

    const performSearch = useCallback(
        async (searchParams: SearchParams = {}, page: number = 0, append: boolean = false) => {
            try {
                if (append) {
                    setLoadingMore(true);
                } else {
                    setLoading(true);
                    setSelectedItem(null);
                }
                setError(null);

                const cleanParams = Object.entries(searchParams).reduce((acc, [key, value]) => {
                    if (value !== undefined && value !== null && value !== "") acc[key] = value;
                    return acc;
                }, {} as SearchParams);

                const finalParams: SearchParams = { ...config.defaultParams, ...cleanParams };

                if (config.pagination?.enabled) {
                    finalParams.page = page;
                    finalParams.size = config.pagination.pageSize || 10;
                }

                if (Object.keys(finalParams).length === 0 && !config.searchOnLoad) {
                    setResults([]);
                    return;
                }

                let searchResults: any;
                if (config.method === "POST") {
                    searchResults = await searchService.searchPost<any>(config.endpoint, finalParams);
                } else {
                    searchResults = await searchService.search<SearchResultItem[]>({ url: config.endpoint, params: finalParams });
                }

                let actualContent = searchResults;
                if (searchResults?.content?.content) {
                    actualContent = searchResults.content;
                }

                if (config.pagination?.enabled) {
                    const content = actualContent?.content || actualContent;
                    const newResults: SearchResultItem[] = Array.isArray(content) ? content : [];

                    setResults((prev) => (append ? [...prev, ...newResults] : newResults));
                    setCurrentPage(actualContent.number ?? 0);
                    setHasMore(!actualContent.last);
                } else {
                    setResults(Array.isArray(actualContent) ? actualContent : []);
                    setHasMore(false);
                }

                setLastSearchParams(searchParams);
            } catch (err) {
                console.error("Modal search error:", err);
                setError("Error al realizar la búsqueda. Verifique los criterios e intente nuevamente.");
                if (!append) setResults([]);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [config]
    );

    // Auto-search on open
    useEffect(() => {
        if (open) {
            reset(formDefaultValues);
            if (config.searchOnLoad && !hasAutoSearchedRef.current) {
                hasAutoSearchedRef.current = true;
                performSearch(formDefaultValues, 0);
            }
        } else {
            hasAutoSearchedRef.current = false;
        }
    }, [open]);

    // IntersectionObserver for infinite scroll sentinel
    useEffect(() => {
        if (!config.pagination?.enabled) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0].isIntersecting) return;
                const { hasMore, loading, loadingMore, currentPage, lastSearchParams } = stateRef.current;
                if (hasMore && !loading && !loadingMore) {
                    const nextPage = currentPage + 1;
                    performSearch(lastSearchParams, nextPage, true);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [results, config.pagination?.enabled, performSearch]);

    const onSubmit = (data: SearchParams) => {
        setCurrentPage(0);
        setHasMore(false);
        performSearch(data, 0, false);
    };

    const handleItemSelect = (item: SearchResultItem) => setSelectedItem(item);

    const handleConfirmSelection = () => {
        if (selectedItem) {
            onSelect(selectedItem);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedItem(null);
        setResults([]);
        setError(null);
        reset();
        onClose();
    };

    const handleClearForm = () => {
        reset();
        setResults([]);
        setError(null);
        setSelectedItem(null);
    };

    const renderField = (field: SearchField) => {
        const commonProps = { size: "small" as const, fullWidth: true, label: field.label, placeholder: field.placeholder };

        switch (field.type) {
            case "select":
                return (
                    <FormControl {...commonProps}>
                        <InputLabel>{field.label}</InputLabel>
                        <Controller
                            name={field.key}
                            control={control}
                            defaultValue=""
                            render={({ field: f }) => (
                                <Select {...f} label={field.label} size="small">
                                    {field.options?.map((o) => (
                                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                );

            case "multiselect":
                return (
                    <FormControl {...commonProps}>
                        <InputLabel>{field.label}</InputLabel>
                        <Controller
                            name={field.key}
                            control={control}
                            defaultValue={[]}
                            render={({ field: f }) => (
                                <Select {...f} multiple label={field.label} size="small" value={f.value || []}>
                                    {field.options?.map((o) => (
                                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
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
                        render={({ field: f }) => (
                            <FormControlLabel
                                control={<Checkbox checked={!!f.value} onChange={(e) => f.onChange(e.target.checked)} />}
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
                        render={({ field: f }) => (
                            <TextField
                                {...f}
                                {...commonProps}
                                type="number"
                                inputProps={{ min: field.validation?.min, max: field.validation?.max }}
                            />
                        )}
                    />
                );

            case "date":
                return (
                    <Controller
                        name={field.key}
                        control={control}
                        render={({ field: f }) => (
                            <TextField {...f} {...commonProps} type="date" InputLabelProps={{ shrink: true }} />
                        )}
                    />
                );

            default:
                return (
                    <Controller
                        name={field.key}
                        control={control}
                        render={({ field: f }) => <TextField {...f} {...commonProps} type="text" />}
                    />
                );
        }
    };

    const renderCellValue = (column: any, item: SearchResultItem) => {
        const value = item[column.key];
        if (column.render) return column.render(value, item);
        if (value === null || value === undefined) return "-";
        if (typeof value === "boolean") return value ? "Sí" : "No";
        return String(value);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { height: "80vh", display: "flex", flexDirection: "column" } }}>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{config.title}</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ display: "flex", flexDirection: "column", overflow: "hidden", p: 2 }}>
                {/* Search Form */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)} mb={2} sx={{ flexShrink: 0 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                        {config.fields.map((field) => (
                            <Box key={field.key} sx={{ minWidth: 200, flex: "1 1 300px" }}>
                                {renderField(field)}
                            </Box>
                        ))}
                        <Box sx={{ minWidth: 200, flex: "1 1 300px" }}>
                            <Box display="flex" gap={1}>
                                <Button type="submit" variant="contained" color="primary" startIcon={<SearchIcon />} disabled={loading} size="small">
                                    Buscar
                                </Button>
                                <Button type="button" variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={handleClearForm} size="small">
                                    Limpiar
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>
                        {error}
                    </Alert>
                )}

                {/* Initial loading */}
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Results Table — fills remaining height, scrolls internally */}
                {!loading && results.length > 0 && (
                    <TableContainer component={Paper} sx={{ flex: 1, overflow: "auto" }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {config.displayColumns.map((column) => (
                                        <TableCell key={column.key} style={{ width: column.width }}>
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((item, index) => {
                                    const isSelected = !!(selectedItem && selectedItem[config.keyField] === item[config.keyField]);
                                    return (
                                        <TableRow
                                            key={item[config.keyField] ?? index}
                                            hover
                                            selected={isSelected}
                                            onClick={() => handleItemSelect(item)}
                                            onDoubleClick={() => {
                                                handleItemSelect(item);
                                                handleConfirmSelection();
                                            }}
                                            style={{ cursor: "pointer" }}>
                                            {config.displayColumns.map((column) => (
                                                <TableCell key={column.key}>{renderCellValue(column, item)}</TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {/* Sentinel observed by IntersectionObserver */}
                        <div ref={sentinelRef} style={{ height: 1 }} />

                        {/* Loading next page */}
                        {loadingMore && (
                            <Box display="flex" justifyContent="center" alignItems="center" py={2} gap={1}>
                                <CircularProgress size={20} />
                                <Typography variant="body2" color="textSecondary">
                                    Cargando más...
                                </Typography>
                            </Box>
                        )}

                        {/* End of results */}
                        {!hasMore && !loadingMore && results.length > 0 && (
                            <Box display="flex" justifyContent="center" py={1}>
                                <Typography variant="caption" color="textSecondary">
                                    — fin de resultados —
                                </Typography>
                            </Box>
                        )}
                    </TableContainer>
                )}

                {/* No results */}
                {!loading && results.length === 0 && !error && (
                    <Box flex={1} display="flex" alignItems="center" justifyContent="center">
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
