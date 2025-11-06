package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityS;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.*;

@Entity
@Table(name = "sg_tipo_menu", schema = "seguridad")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SgTipoMenu extends BaseEntityS implements Serializable {

  private static final long serialVersionUID = 1L;

  @Column(name = "tipo")
  String tipoMenu;
}
