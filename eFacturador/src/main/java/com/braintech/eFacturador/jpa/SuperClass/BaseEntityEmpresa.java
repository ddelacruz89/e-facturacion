package com.braintech.eFacturador.jpa.SuperClass;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseEntityEmpresa {
  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "activo")
  private Boolean activo;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;
}
