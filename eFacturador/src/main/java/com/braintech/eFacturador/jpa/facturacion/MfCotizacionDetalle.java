package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.general.MgItbis;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "mf_cotizacion_detalle", schema = "facturacion")
@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class MfCotizacionDetalle implements Serializable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cotizacion_id")
  private MfCotizacion cotizacion;

  @Column(name = "linea")
  private Integer linea;

  @Column(name = "producto_id")
  private Integer productoId;

  @Column(name = "producto_desc")
  private String productoDesc;

  @Column(name = "precio_costo", precision = 18, scale = 2)
  private BigDecimal precioCosto;

  @Column(name = "precio_venta_und", precision = 18, scale = 2)
  private BigDecimal precioVentaUnd;

  @Column(name = "precio_venta", precision = 18, scale = 2)
  private BigDecimal precioVenta;

  @Column(name = "precio_itbis", precision = 18, scale = 2)
  private BigDecimal precioItbis;

  @Column(name = "monto_descuento", precision = 18, scale = 2)
  private BigDecimal montoDescuento;

  @Column(name = "cantidad", precision = 18, scale = 2)
  private BigDecimal cantidad;

  @Column(name = "monto_venta", precision = 18, scale = 2)
  private BigDecimal montoVenta;

  @Column(name = "itbis_id")
  private Integer itbisId;

  @JoinColumn(name = "itbis_id", insertable = false, updatable = false)
  @ManyToOne(optional = false)
  private MgItbis oItbisId;

  @Column(name = "monto_itbis", precision = 18, scale = 2)
  private BigDecimal montoItbis;

  @Column(name = "monto_total", precision = 18, scale = 2)
  private BigDecimal montoTotal;

  @Column(name = "retencion_itbis", precision = 18, scale = 2)
  private BigDecimal retencionItbis;

  @Column(name = "retencion_isr", precision = 18, scale = 2)
  private BigDecimal retencionIsr;

  public BigDecimal getPrecioItbis() {
    BigDecimal precioVenta = getPrecioVenta() != null ? getPrecioVenta() : BigDecimal.ZERO;
    return precioVenta.multiply(oItbisId.getItbis());
  }
}

