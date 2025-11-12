import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    InputAdornment,
    Box,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    ToggleButtonGroup,
    ToggleButton,
    Paper,
    TableContainer,
    Chip,
} from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

// Types
interface HeaderColumn {
    name: string;
    column: string;
    objectName?: string;
    money?: boolean;
}

interface FindByOption {
    key: string;
    name: string;
    default?: boolean;
}

interface EstadoOption {
    id: string;
    estado: string;
}

interface CuentaContableOption {
    id: number;
    nombreCuenta: string;
}

export interface ModalSearchInputTextPaginacionProps {
    // Required props
    api: string;
    header: HeaderColumn[];
    findBy: FindByOption[];
    selected: (item: any) => void;
    label: string;
    title: string;

    // Optional props
    value?: string;
    col?: string;
    disabled?: boolean;
    paginacion?: boolean;
    simboloAnd?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    placeholder?: string;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
    invalid?: boolean;
    onlyButton?: boolean;
    right?: string | number;

    // Estado options
    estados?: EstadoOption[];
    defaultEstado?: string;

    // Cuenta contable options
    cuentasContables?: CuentaContableOption[];
    cuentaDefault?: number;

    // External modal control
    modalExterior?: () => void;
    getVisibilityStateRef?: (setModalFunction: (visible: boolean) => void) => void;
    cargaInicial?: boolean;
}

interface ApiResponse {
    content: any[];
    number: number;
    totalElements: number;
    totalPages: number;
}

const ModalSearchInputTextPaginacion: React.FC<ModalSearchInputTextPaginacionProps> = ({
    api,
    header,
    findBy,
    selected,
    label,
    title,
    value = "",
    col = "form-group col-sd-4 col-sm-4 col-lg-3",
    disabled = false,
    paginacion = true,
    simboloAnd = false,
    size = "lg",
    placeholder = "Buscar aquí...",
    color = "primary",
    invalid = false,
    onlyButton = false,
    right = 0,
    estados,
    defaultEstado = "",
    cuentasContables,
    cuentaDefault = 0,
    modalExterior,
    getVisibilityStateRef,
    cargaInicial = false,
}) => {
    // State
    const [pageNo, setPageNo] = useState<number>(0);
    const [pageSize] = useState<number>(20);
    const [modal, setModal] = useState<boolean>(false);
    const [estado, setEstado] = useState<string>(defaultEstado);
    const [cuenta, setCuenta] = useState<number>(cuentaDefault);
    const [datos, setDatos] = useState<any[]>([]);
    const [findBySelected, setFindBySelected] = useState<string | undefined>(undefined);
    const [userQuery, setUserQuery] = useState<string>("");
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
    const [loading, setLoading] = useState<boolean>(false);

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Effects
    useEffect(() => {
        if (getVisibilityStateRef) {
            getVisibilityStateRef(setModal);
        }
    }, [getVisibilityStateRef]);

    // Helper functions
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2,
        }).format(value);
    };

    const find = useCallback(
        async (pageValue?: number, textSearch?: string) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            const newTimeoutId = setTimeout(async () => {
                setLoading(true);
                try {
                    const currentPageNo = pageValue !== undefined ? pageValue : pageNo;

                    let tipoBusqueda: string;
                    if (!findBySelected) {
                        const defaultFind = findBy.find((item) => item.default);
                        tipoBusqueda = defaultFind?.key || findBy[0]?.key || "";
                        setFindBySelected(tipoBusqueda);
                    } else {
                        tipoBusqueda = findBySelected;
                    }

                    const searchText = textSearch !== undefined ? textSearch : userQuery;

                    let url = api;

                    if (paginacion) {
                        const separator = simboloAnd ? "&" : "?";
                        url += `${separator}busqueda=${encodeURIComponent(
                            searchText
                        )}&tipoBusqueda=${tipoBusqueda}&pageNo=${currentPageNo}&pageSize=${pageSize}`;
                    }

                    if (estados && estado) {
                        url += `/${estado}`;
                    }

                    if (cuentasContables && cuenta) {
                        url += `/${cuenta}`;
                    }

                    const response = await fetch(url);
                    const json: ApiResponse = await response.json();

                    if (currentPageNo === 0) {
                        setDatos(json.content);
                    } else {
                        setDatos((prev) => [...prev, ...json.content]);
                    }

                    setPageNo(json.number + 1);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }, 600);

            setTimeoutId(newTimeoutId);
        },
        [
            api,
            pageNo,
            pageSize,
            findBySelected,
            findBy,
            simboloAnd,
            paginacion,
            estados,
            estado,
            cuentasContables,
            cuenta,
            userQuery,
            timeoutId,
        ]
    );

    // Event handlers
    const handleFindByChange = (event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
        if (newValue) {
            setFindBySelected(newValue);
            find(0, userQuery);
        }
    };

    const handleEstadoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newEstado = event.target.value;
        setEstado(newEstado);
        find(0, userQuery);
    };

    const handleCuentaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newCuenta = Number(event.target.value);
        setCuenta(newCuenta);
        setPageNo(0);
        find(0, userQuery);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        setUserQuery(text);
        find(0, text);
    };

    const handleRowClick = (row: any, index: number) => {
        selected(row);
        setModal(false);
        setFindBySelected(undefined);
        setSelectedRowIndex(-1);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            let newIndex = selectedRowIndex;

            if (event.key === "ArrowUp" && selectedRowIndex > 0) {
                newIndex = selectedRowIndex - 1;
            } else if (event.key === "ArrowDown" && selectedRowIndex < datos.length - 1) {
                newIndex = selectedRowIndex + 1;
            } else if (event.key === "ArrowDown" && selectedRowIndex === -1) {
                newIndex = 0;
            }

            setSelectedRowIndex(newIndex);
        } else if (event.key === "Enter" && selectedRowIndex >= 0) {
            handleRowClick(datos[selectedRowIndex], selectedRowIndex);
        }
    };

    const openModal = () => {
        setModal(true);
        find(0);
        if (modalExterior) {
            modalExterior();
        }
    };

    const closeModal = () => {
        setModal(false);
        setEstado(defaultEstado);
        setCuenta(cuentaDefault);
        setFindBySelected(undefined);
        setSelectedRowIndex(-1);
        setUserQuery("");
        setDatos([]);
    };

    // Render table cells
    const renderTableCell = (row: any, column: HeaderColumn, index: number) => {
        let cellValue: any;

        if (column.objectName) {
            cellValue = row[column.objectName]?.[column.column];
        } else {
            cellValue = row[column.column];
        }

        if (column.money && typeof cellValue === "number") {
            return <TableCell key={index}>{formatCurrency(cellValue)}</TableCell>;
        }

        return <TableCell key={index}>{cellValue}</TableCell>;
    };

    // Find by toggle buttons
    const findByButtons = (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Buscar por:
            </Typography>
            <ToggleButtonGroup value={findBySelected} exclusive onChange={handleFindByChange} size="small" color="primary">
                {findBy.map((option) => (
                    <ToggleButton key={option.key} value={option.key}>
                        {option.name}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );

    // Estados radio group
    const estadosGroup = estados && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
            <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ color: "inherit" }}>
                    Estados
                </FormLabel>
                <RadioGroup row value={estado} onChange={handleEstadoChange}>
                    {estados.map((option) => (
                        <FormControlLabel
                            key={option.id}
                            value={option.id}
                            control={<Radio sx={{ color: "inherit" }} />}
                            label={option.estado}
                            sx={{ color: "inherit" }}
                        />
                    ))}
                </RadioGroup>
            </FormControl>
        </Box>
    );

    // Cuentas contables radio group
    const cuentasGroup = cuentasContables && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
            <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ color: "inherit" }}>
                    Cuentas Contables
                </FormLabel>
                <RadioGroup row value={cuenta.toString()} onChange={handleCuentaChange}>
                    {cuentasContables.map((option) => (
                        <FormControlLabel
                            key={option.id}
                            value={option.id.toString()}
                            control={<Radio sx={{ color: "inherit" }} />}
                            label={option.nombreCuenta}
                            sx={{ color: "inherit" }}
                        />
                    ))}
                </RadioGroup>
            </FormControl>
        </Box>
    );

    return (
        <>
            {onlyButton ? (
                <Button
                    variant="contained"
                    color={color}
                    size="small"
                    disabled={disabled}
                    onClick={openModal}
                    sx={{ position: "relative", right: right }}>
                    {label}
                </Button>
            ) : (
                <Box className={col}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                        {label}
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        value={value}
                        placeholder={placeholder}
                        error={invalid}
                        helperText={invalid ? `El campo ${label} es requerido` : undefined}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton color={color} disabled={disabled} onClick={openModal} edge="end">
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            )}

            <Dialog open={modal} onClose={closeModal} maxWidth={size} fullWidth onKeyDown={handleKeyDown}>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <SearchIcon />
                        <Typography variant="h6">BUSCAR: {title}</Typography>
                        <Box flexGrow={1} />
                        <IconButton onClick={closeModal}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                {estadosGroup}
                {cuentasGroup}

                <DialogContent>
                    {findByButtons}

                    <TextField
                        ref={searchInputRef}
                        fullWidth
                        autoFocus
                        placeholder={placeholder}
                        value={userQuery}
                        onChange={handleSearchChange}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: "calc(100vh - 400px)",
                            overflow: "auto",
                        }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {header.map((column) => (
                                        <TableCell key={column.name}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {column.name}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {datos.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        hover
                                        onClick={() => handleRowClick(row, index)}
                                        selected={selectedRowIndex === index}
                                        sx={{ cursor: "pointer" }}>
                                        {header.map((column, cellIndex) => renderTableCell(row, column, cellIndex))}
                                    </TableRow>
                                ))}
                                {datos.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={header.length} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No hay datos disponibles
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {paginacion && (
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Button variant="outlined" fullWidth onClick={() => find(undefined, userQuery)} disabled={loading}>
                                {loading ? "Cargando..." : "Cargar más"}
                            </Button>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeModal}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ModalSearchInputTextPaginacion;
