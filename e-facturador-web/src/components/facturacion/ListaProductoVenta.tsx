import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { getProductosVentas } from "../../apis/FacturaController";
import { ProductoVenta } from "../../models/producto/productoVenta";
import './list.css';

interface ListaProductoVentaProps {
    onSelectProducto: (producto: ProductoVenta) => void;
}

export default function ListaProductoVenta({ onSelectProducto }: ListaProductoVentaProps) {
    const [productos, setProductos] = useState<ProductoVenta[]>([]);
    useEffect(() => {
        getProductosVentas().then((data) => {
            setProductos([...data, ...data]);
        });
    }, []);
    return (
        <div style={{ width: '350px', border: '1px solid #ccc', borderRadius: 5, padding: 10 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {productos.map((producto) => (
                    <ItemProductoVenta onSelectProducto={onSelectProducto} key={producto.id} producto={producto} />
                ))}
            </ul>
        </div>
    );
}

const ItemProductoVenta = ({ producto, onSelectProducto }: { producto: ProductoVenta, onSelectProducto: (producto: ProductoVenta) => void }) => {
    return (
        <li onClick={() => onSelectProducto(producto)} key={producto.id} style={{ marginBottom: 10, border: '1px solid #363636ff', borderRadius: 5, padding: 5 }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                <div style={{
                    textAlign: 'center',
                    backgroundColor: '#7bb9ffff',
                    color: 'black',
                    padding: 5,
                    borderRadius: "50%",
                    width: 50,
                    height: 50,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',

                }}>
                    {producto.secuencia}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ textAlign: 'center', alignItems: 'center' }}>{producto.nombreProducto}</div>
                    <div style={{ textAlign: 'right', alignItems: 'right' }}>
                        {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(producto.precioVenta)}
                    </div>
                </div>
            </div>
        </li>
    );
}


