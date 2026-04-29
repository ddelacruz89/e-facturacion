package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "in_inventarios", schema = "inventario")
@Getter
@Setter
public class InInventario extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  private Double cantidad;

  @JoinColumn(name = "almacen_id")
  @ManyToOne(optional = false)
  private InAlmacen almacenId;

  @JoinColumn(name = "producto_id")
  @ManyToOne(optional = false)
  @JsonIgnore
  private MgProducto productoId;

  @Column(name = "estado_producto_inventario")
  private String estadoProductoInventario;

  @Column(name = "lote")
  private String loteId;
  // sucursalId heredado de BaseSucursal — no redeclarar aquí
}
