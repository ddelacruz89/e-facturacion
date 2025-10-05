package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.producto.MgProducto;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name = "in_cotizacion_detalle", schema = "inventario")
public class InCotizacionDetalle implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Column(name = "cantidad")
  private Integer cantidad;

  @Column(name = "cantidad_tablar")
  private Double cantidadTablar;

  @Column(name = "cantidad_pedida")
  private Integer cantidadPedida;

  @Column(name = "orden_compra_id")
  private Integer ordenCompraId;

  @Column(name = "inventario_actual")
  private String inventarioActual;

  @Column(name = "precio_venta")
  private BigDecimal precioVenta;

  @Column(name = "precio_compra")
  private BigDecimal precioCompra;

  @Column(name = "sub_total")
  private BigDecimal subTotal;

  @Column(name = "itbis_porciento")
  private Double itbisPorciento;

  @Column(name = "itbis")
  private BigDecimal itbis;

  @Column(name = "total")
  private BigDecimal total;

  @Column(name = "estado", insertable = false)
  private String estado;

  @JoinColumn(name = "cotizacion_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private InCotizacion cotizacionId;

  @JoinColumn(name = "suplidor_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private InSuplidor suplidorId;

  @JoinColumn(name = "producto_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private MgProducto productoId;
}
