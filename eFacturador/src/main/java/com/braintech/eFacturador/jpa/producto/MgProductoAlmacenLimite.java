package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "mg_producto_almacen_limite")
@Getter
@Setter
public class MgProductoAlmacenLimite extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Column(name = "limite")
  private Integer limite;

  @JoinColumn(name = "almacen_id", referencedColumnName = "id")
  @ManyToOne
  private InAlmacen almacenId;
}
