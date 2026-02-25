package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "in_ordenes_compras_detalles", schema = "inventario")
@Getter
@Setter
public class InOrdenesComprasDetalles implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  @Basic(optional = false)
  private int cantidad;

  // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these
  // annotations to enforce field validation

  @Basic(optional = false)
  @Column(name = "precio_unitario")
  private BigDecimal precioUnitario;

  @Column(name = "itbis_producto")
  private BigDecimal itbisProducto;

  @Basic(optional = false)
  private BigDecimal subTotal;

  private BigDecimal itbis;
  private BigDecimal total;

  @JoinColumn(name = "orden_compra_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  @JsonIgnoreProperties({"inOrdenesComprasDetallesList", "suplidorId"})
  private InOrdenesCompras ordenCompraId;

  @JoinColumn(name = "producto_id")
  @ManyToOne(optional = false)
  @JsonIgnoreProperties({
    "unidadProductorSuplidor",
    "inInventarioList",
    "categoriaId",
    "itbisId",
    "unidadMedida",
    "mgProductoTagsList"
  })
  private MgProducto productoId;

  @Column(name = "unidad_compra_nombre")
  private String unidadNombre;

  @Column(name = "unidad_compra_fraccion_cantidad")
  private Integer unidadCantidad;

  @Column(name = "descuento_porciento")
  private Double descuentoPorciento;

  @Column(name = "descuento_cantidad")
  private Double descuentoCantidad;

  @Column(name = "estado_id")
  private String estadoId;

  public InOrdenesComprasDetalles() {}

  public InOrdenesComprasDetalles(Integer id) {
    this.id = id;
  }

  public InOrdenesComprasDetalles(
      Integer id, int cantidad, BigDecimal precioUnitario, BigDecimal subTotal) {
    this.id = id;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subTotal = subTotal;
  }

  @Override
  public int hashCode() {
    int hash = 0;
    hash += (id != null ? id.hashCode() : 0);
    return hash;
  }

  @Override
  public boolean equals(Object object) {
    // TODO: Warning - this method won't work in the case the id fields are not set
    if (!(object instanceof InOrdenesComprasDetalles other)) {
      return false;
    }
    return (this.id != null || other.id == null) && (this.id == null || this.id.equals(other.id));
  }
}
