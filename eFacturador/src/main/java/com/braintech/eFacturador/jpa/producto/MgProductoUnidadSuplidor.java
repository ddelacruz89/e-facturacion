package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "mg_producto_unidad_suplidor", schema = "producto")
@Getter
@Setter
public class MgProductoUnidadSuplidor extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

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

  @NotNull(message = "Debe elegir un itbis")
  @Column(name = "itbis_default")
  private Boolean itbisDefault;

  @NotNull(message = "Preico no puede ser nulo")
  private BigDecimal precio;

  @JoinColumn(name = "unidad_fraccion_id")
  @ManyToOne(optional = false)
  @NotNull(message = "Unidad de fracción no puede ser null")
  private MgUnidad unidadFraccionId;

  @JoinColumn(name = "unidad_id")
  @ManyToOne(optional = false)
  @NotNull(message = "Unidad de fracción no puede ser null")
  private MgUnidad unidadId;

  @Column(name = "cantidad")
  private Integer cantidad;

  @ManyToOne(optional = false)
  @JoinColumn(name = "producto_id", nullable = false)
  private MgProducto productoId;

  @OneToMany(cascade = CascadeType.ALL)
  @JoinColumn(name = "producto_suplidor_id", referencedColumnName = "id")
  private List<MgProductoSuplidor> productosSuplidores;

  @OneToMany(cascade = CascadeType.ALL)
  @JoinColumn(name = "producto_unidad_suplidor_id", referencedColumnName = "id")
  private List<MgProductoUnidadSuplidorLimiteAlmacen> productosAlmacenesLimites;
}
