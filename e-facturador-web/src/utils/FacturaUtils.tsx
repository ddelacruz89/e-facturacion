import { Factura, FacturaDetalle } from "../models/facturacion";
import { ProductoVenta } from "../models/producto/productoVenta";

function calcularTotal(factura: Factura): Factura {
    let total = 0;
    factura.detalles.forEach((detalle) => {
        total += detalle.precioVenta * detalle.cantidad;
    });
    factura.total = total;
    return factura;
}

function detalleItbis(producto: ProductoVenta, detalleFactura: FacturaDetalle): FacturaDetalle {
    if (producto.itbis > 0) {
        let montoTotal = (producto.precioItbis + producto.precioVenta) * detalleFactura.cantidad;
        let montoItbis = producto.precioItbis * detalleFactura.cantidad;
        let precioVentaUnd = producto.precioVenta
        let montoVenta = precioVentaUnd * detalleFactura.cantidad

        detalleFactura.precioVenta = precioVentaUnd;
        detalleFactura.precioVentaUnd = precioVentaUnd;
        detalleFactura.montoItbis = montoItbis;
        detalleFactura.montoVenta = montoVenta;
        detalleFactura.montoTotal = montoTotal;
    }
    return detalleFactura;
}


function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2
    }).format(value);
}

export { calcularTotal, detalleItbis, formatCurrency };
