package com.braintech.eFacturador.jpa.facturacion;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Table(name="mf_factura_detalle")
@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class MfFacturaDetalle{
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id")
    private Integer id;
    @Column(name="factura_id")
    private Integer facturaId;
    @Column(name="linea")
    private Integer linea;
    @Column(name="producto_id")
    private Integer productoId;
    @Column(name="precio_costo")
    private BigDecimal precioCosto;
    @Column(name="precio_venta_und")
    private BigDecimal precioVentaUnd;
    @Column(name="precio_venta")
    private BigDecimal precioVenta;
    @Column(name="monto_descuento")
    private BigDecimal montoDescueto;
    @Column(name="cantidad")
    private BigDecimal cantidad;
    @Column(name="monto_venta")
    private BigDecimal montoVenta;
    @Column(name="itbis_id")
    private Integer itbisId;
    @Column(name="monto_itbis")
    private BigDecimal montoItbis;
    @Column(name="retencion_itbis")
    private BigDecimal retencionItbis;
    @Column(name="retencion_isr")
    private BigDecimal retencionIsr;
    @Column(name="almacen_id")
    private Integer almacenId;


}
