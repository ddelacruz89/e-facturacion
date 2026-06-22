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

function detalleItbis(producto: ProductoVenta, detalleFactura: FacturaDetalle, retencion: number): FacturaDetalle {
    let montoTotal = (producto.precioItbis + producto.precioVenta) * detalleFactura.cantidad;
    let montoItbis = producto.precioItbis * detalleFactura.cantidad;
    let precioVentaUnd = producto.precioVenta
    let montoVenta = precioVentaUnd * detalleFactura.cantidad

    detalleFactura.precioVenta = precioVentaUnd;
    detalleFactura.precioVentaUnd = precioVentaUnd;
    detalleFactura.montoItbis = montoItbis;
    detalleFactura.montoVenta = montoVenta;
    detalleFactura.montoTotal = montoTotal;
    if (retencion > 0) {
        detalleFactura.retencionIsr = 0;
        detalleFactura.retencionItbis = (montoItbis * retencion) / 100;
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
