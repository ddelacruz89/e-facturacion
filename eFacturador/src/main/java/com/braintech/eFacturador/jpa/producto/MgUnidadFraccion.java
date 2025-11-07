package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "mg_unidades_fracciones")
@Data
@EqualsAndHashCode(callSuper = false)
public class MgUnidadFraccion extends BaseEntity implements Serializable {

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
}
