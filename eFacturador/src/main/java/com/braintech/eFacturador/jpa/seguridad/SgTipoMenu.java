package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "sg_tipo_menu", schema = "seguridad")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SgTipoMenu implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Column(name = "id")
  String id;

  @Column(name = "tipo")
  String tipoMenu;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "activo")
  private Boolean activo;
}
