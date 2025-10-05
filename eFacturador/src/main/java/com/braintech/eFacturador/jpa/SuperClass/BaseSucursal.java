package com.braintech.eFacturador.jpa.SuperClass;

import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "estado_id")
  private String estadoId;

  @JoinColumn(name = "sucursal_id")
  @ManyToOne(optional = false)
  private SgSucursal sucursalId;
}
