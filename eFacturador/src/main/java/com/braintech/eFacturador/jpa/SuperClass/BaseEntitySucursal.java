package com.braintech.eFacturador.jpa.SuperClass;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseEntitySucursal extends BaseEntityPk implements Serializable {
  private static final long serialVersionUID = 1L;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "sucursal_id", updatable = false)
  @NotNull(message = "SucursalId no puede ser nulo")
  private Integer sucursalId;

  @Column(name = "activo")
  private Boolean activo;

  public BaseEntitySucursal(int i) {
    super(i);
  }

  public BaseEntitySucursal() {
    super();
  }
}
