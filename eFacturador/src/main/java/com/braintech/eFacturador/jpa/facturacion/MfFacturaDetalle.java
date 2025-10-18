package com.braintech.eFacturador.jpa.facturacion;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "mf_factura_detalle", schema = "facturacion")
@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class MfFacturaDetalle implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @ManyToOne
  @JoinColumn(name = "factura_id")
  @JsonManagedReference
  private MfFactura facturaId;

  @Column(name = "linea")
  private Integer linea;

  @Column(name = "producto_id")
  private Integer productoId;

  @Column(name = "precio_costo")
  private BigDecimal precioCosto;

  @Column(name = "precio_venta_und")
  private BigDecimal precioVentaUnd;

  @Column(name = "precio_venta")
  private BigDecimal precioVenta;

  @Column(name = "monto_descuento")
  private BigDecimal montoDescueto;

  @Column(name = "cantidad")
  private BigDecimal cantidad;

  @Column(name = "monto_venta")
  private BigDecimal montoVenta;

  @Column(name = "itbis_id")
  private Integer itbisId;

  @Column(name = "monto_itbis")
  private BigDecimal montoItbis;

  @Column(name = "retencion_itbis")
  private BigDecimal retencionItbis;

  @Column(name = "retencion_isr")
  private BigDecimal retencionIsr;

  @Column(name = "almacen_id")
  private Integer almacenId;

  public Integer getFacturaId() {
    return facturaId != null ? facturaId.getId() : null;
  }
}
