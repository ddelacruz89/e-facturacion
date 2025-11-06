package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "sg_modulo", schema = "seguridad")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SgModulo implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Column(name = "id", length = 5)
  String id;

  @Column(name = "modulo")
  String modulo;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "activo")
  private Boolean activo;

  @OneToMany(mappedBy = "moduloId", cascade = CascadeType.ALL, orphanRemoval = true)
  List<SgMenu> menus;
}
