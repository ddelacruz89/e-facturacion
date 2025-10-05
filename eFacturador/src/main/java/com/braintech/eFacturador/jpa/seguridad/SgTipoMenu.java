package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "sg_tipo_menu", schema = "seguridad")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SgTipoMenu extends BaseEntity {
  @Id
  @Column(name = "id")
  String id;

  @Column(name = "tipo")
  String tipoMenu;
}
