package com.braintech.eFacturador.jpa.SuperClass;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseEntity extends BaseEntityPk {
  private static final long serialVersionUID = 1L;

  @Column(name = "usuario_reg", nullable = false)
  protected String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  protected LocalDateTime fechaReg;

  @Column(name = "activo")
  protected Boolean activo;
}
