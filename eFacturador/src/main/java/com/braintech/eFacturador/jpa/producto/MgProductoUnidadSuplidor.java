package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityEmpresa;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "mg_producto_unidad_suplidor", schema = "producto")
@Getter
@Setter
public class MgProductoUnidadSuplidor extends BaseEntityEmpresa implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
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

  @NotNull(message = "Debe elegir un itbis")
  @Column(name = "itbis_default")
  private Boolean itbisDefault;

  @NotNull(message = "Preico no puede ser nulo")
  private BigDecimal precio;

  @JoinColumn(name = "suplidor_id")
  @ManyToOne(optional = false)
  @NotNull(message = "Suplidor no puede ser null")
  private InSuplidor suplidor;

  @JoinColumn(name = "unidad_fraccion_id")
  @ManyToOne(optional = false)
  @NotNull(message = "Unidad de fracción no puede ser null")
  private MgUnidadFraccion unidadFraccion;
}
