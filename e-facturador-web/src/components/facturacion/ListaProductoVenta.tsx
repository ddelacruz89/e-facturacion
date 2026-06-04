import { useEffect, useState, useMemo } from "react";
import {
    Box,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    Typography,
    Chip,
    IconButton,
    Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { getProductosVentas } from "../../apis/FacturaController";
import { ProductoVenta } from "../../models/producto/productoVenta";
import './list.css';

interface ListaProductoVentaProps {
    onSelectProducto: (producto: ProductoVenta) => void;
}

export default function ListaProductoVenta({ onSelectProducto }: ListaProductoVentaProps) {
    const [productos, setProductos] = useState<ProductoVenta[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getProductosVentas().then((data) => {
            setProductos(data);
        });
    }, []);

    const filteredProductos = useMemo(() => {
        if (!searchTerm.trim()) return productos;
        const term = searchTerm.toLowerCase();
        return productos.filter(p =>
            p.nombreProducto.toLowerCase().includes(term) ||
            (p.codigoBarra && p.codigoBarra.toLowerCase().includes(term))
        );
    }, [productos, searchTerm]);

    return (
        <Paper
            elevation={1}
            sx={{
                width: '350px',
                borderRadius: 2,
                padding: '16px 12px 16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                bgcolor: '#fafafa',
                border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
        >
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Catálogo de Productos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {filteredProductos.length} de {productos.length} productos
                </Typography>
            </Box>

            <TextField
                placeholder="Buscar por nombre o barra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm("")} edge="end">
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        )
                    }
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#ffffff'
                    }
                }}
            />

            <Box className="product-list-container">
                {filteredProductos.length > 0 ? (
                    <List disablePadding>
                        {filteredProductos.map((producto, index) => (
                            <ItemProductoVenta
                                onSelectProducto={onSelectProducto}
                                key={producto.id}
                                producto={producto}
                                index={index}
                            />
                        ))}
                    </List>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        color: 'text.secondary',
                        textAlign: 'center',
                        gap: 1
                    }}>
                        <SearchIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                        <Typography variant="body2" fontWeight="medium">
                            No hay coincidencias
                        </Typography>
                        <Typography variant="caption">
                            Prueba con otra descripción o código
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

interface ItemProductoVentaProps {
    producto: ProductoVenta;
    onSelectProducto: (producto: ProductoVenta) => void;
    index: number;
}

const ItemProductoVenta = ({ producto, onSelectProducto, index }: ItemProductoVentaProps) => {
    const totalStock = useMemo(() => {
        return producto.inventarios?.reduce((sum, inv) => sum + inv.cantidad, 0) ?? 0;
    }, [producto.inventarios]);

    const formattedPrice = useMemo(() => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(producto.precioVenta);
    }, [producto.precioVenta]);

    return (
        <ListItem
            onClick={() => onSelectProducto(producto)}
            className="product-item-card animate-fade-in"
            sx={{
                p: 1.5,
                animationDelay: `${Math.min(index * 0.03, 0.3)}s`,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5
            }}
        >
            <Avatar 
                className="product-avatar-gradient" 
                sx={{ 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.8rem', 
                    flexShrink: 0 
                }}
            >
                {producto.secuencia}
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography
                    variant="body2"
                    fontWeight="600"
                    color="text.primary"
                    sx={{
                        fontSize: '0.9rem',
                        lineHeight: 1.2,
                        wordBreak: 'break-word'
                    }}
                >
                    {producto.nombreProducto}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        {producto.codigoBarra && (
                            <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                    fontSize: '0.7rem', 
                                    lineHeight: 1.1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                Cód: {producto.codigoBarra}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                            <Chip
                                label={totalStock > 0 ? `Stock: ${totalStock}` : 'Agotado'}
                                size="small"
                                sx={{
                                    height: 16,
                                    fontSize: '0.65rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    ...(totalStock > 0 ? {
                                        bgcolor: '#e8f5e9',
                                        color: '#2e7d32',
                                    } : {
                                        bgcolor: '#ffebee',
                                        color: '#c62828',
                                    })
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        <Typography variant="body2" fontWeight="700" color="primary.main">
                            {formattedPrice}
                        </Typography>
                        <AddCircleOutlineIcon className="add-icon-indicator" fontSize="small" />
                    </Box>
                </Box>
            </Box>
        </ListItem>
    );
};
