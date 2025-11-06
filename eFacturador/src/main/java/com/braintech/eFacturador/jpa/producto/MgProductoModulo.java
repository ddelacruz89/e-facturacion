package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.braintech.eFacturador.jpa.seguridad.SgMenu;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_producto_modulo", schema = "producto")
@Data
@NoArgsConstructor
public class MgProductoModulo extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @JoinColumn(name = "sg_menu_id", referencedColumnName = "id")
  @ManyToOne
  private SgMenu sgMenuId;

  public MgProductoModulo(Integer id) {
    this.id = id;
  }
}
