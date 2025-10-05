package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.producto.MgProducto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
@Entity
@Table(name = "in_orden_entrada_detalle", schema = "inventario")
public class InOrdenEntradaDetalle implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Basic(optional = false)
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @NotNull(message = "Cantidad no debe estar vacio")
  private Integer cantidad;

  @Column(name = "cantidad_tablar")
  private Double cantidadTablar;

  private String lote;

  // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these
  // annotations to enforce field validation
  @Basic(optional = false)
  @Column(name = "precio_unitario")
  private BigDecimal precioUnitario;

  @Basic(optional = false)
  private BigDecimal subTotal;

  @Basic(optional = false)
  private BigDecimal itbis;

  @Basic(optional = false)
  private BigDecimal total;

  @Column(name = "descuento_porciento")
  private Double descuentoPorciento;

  private Boolean extra;

  @JoinColumn(name = "orden_entrada_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private InOrdenEntrada ordenEntradaId;

  @JoinColumn(name = "producto_id")
  @ManyToOne(optional = false)
  private MgProducto productoId;

  @Column(name = "unidad_entrada_nombre")
  private String unidadNombre;

  @Column(name = "unidad_entrada_fraccion_cantidad")
  private Integer unidadCantidad;

  @Column(name = "itbis_al_sub_total")
  private Boolean itbisAlSubTotal;

  @Column(name = "servicio")
  private Boolean servicio;

  @Column(name = "estado", insertable = false)
  private String estado;

  @JoinColumn(name = "suplidor_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private InSuplidor suplidorId;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "ordenEntradaDetalle", fetch = FetchType.EAGER)
  private List<InOrdenEntradaDetalleLote> inOrdenDetalleLotes;

  @Transient Boolean anulado;
}
