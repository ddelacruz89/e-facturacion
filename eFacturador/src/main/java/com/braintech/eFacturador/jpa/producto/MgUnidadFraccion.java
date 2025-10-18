package com.braintech.eFacturador.jpa.producto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "mg_unidades_fracciones")
public class MgUnidadFraccion implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Column(name = "existencia")
  private Integer existencia;

  @Column(name = "precio_venta")
  private BigDecimal precioVenta;

  @Column(name = "precio_minimo")
  private BigDecimal precioMinimo;

  @Column(name = "disponible_compra")
  @Comment("Indica si el producto  está disponible para compras ")
  private Boolean disponibleEnCompra;

  @Column(name = "disponible_venta")
  @Comment("Indica si el producto está disponible para  ventas")
  private Boolean disponibleEnVenta;

  @Column(name = "precio_costo_avg")
  private BigDecimal precioCostoAvg;

  @Basic(optional = false)
  @Column(name = "cantidad")
  private int cantidad;

  @JoinColumn(name = "unidad_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private MgUnidad unidadId;

  @JoinColumn(name = "unidad_fraccion_id")
  @ManyToOne(optional = false)
  private MgUnidad unidadFraccionId;

  @JoinColumn(name = "producto_id")
  @ManyToOne(optional = false)
  @NotNull(message = "Producto no puede ser null")
  private MgProducto productoId;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg", insertable = false)
  @Temporal(TemporalType.TIMESTAMP)
  private Date fechaReg;

  @Column(name = "estado_id", insertable = false)
  private String estadoId;
}
