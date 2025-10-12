package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "sg_usuario_almacen", schema = "seguridad")
public class SgUsuarioAlmacen implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Column(name = "permiso")
  private Boolean permiso;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Basic(optional = false)
  @Column(name = "fecha_reg", columnDefinition = "TIMESTAMP", insertable = false, updatable = false)
  private LocalDateTime fechaReg;

  @JoinColumn(name = "almacen_id", referencedColumnName = "id")
  @ManyToOne
  private InAlmacen almacenId;
}
