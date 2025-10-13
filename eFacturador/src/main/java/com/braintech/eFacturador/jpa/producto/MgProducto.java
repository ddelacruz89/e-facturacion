package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.facturacion.MgItbis;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Table(name = "mg_producto", schema = "producto")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MgProducto implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Column(name = "codigoBarra")
  private String codigoBarra;

  @Column(name = "nombre_producto")
  private String nombreProducto;

  @Column(name = "descripcion")
  private String descripcion;

  @Column(name = "unidad_id")
  private String unidadId;

  @Column(name = "existencia")
  private Integer existencia;

  @Column(name = "precio_venta")
  private BigDecimal precioVenta;

  @Column(name = "precio_minimo")
  private BigDecimal precioMinimo;

  @Column(name = "disponible_solo_en_compra")
  @Comment("Indica si el producto solo está disponible para compras y no para ventas")
  private Boolean soloEnCompra;

  @Column(name = "precio_costo_avg")
  private BigDecimal precioCostoAvg;

  @Column(name = "trabajador")
  private Boolean trabajador;

  @Column(name = "comision")
  private BigDecimal comision;

  @JoinColumn(name = "itbis_id")
  @ManyToOne(optional = false)
  private MgItbis itbisId;

  @JoinColumn(name = "categoria_id")
  @ManyToOne(optional = false)
  private MgCategoria categoriaId;
}
