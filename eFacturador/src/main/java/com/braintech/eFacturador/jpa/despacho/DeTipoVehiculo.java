package com.braintech.eFacturador.jpa.despacho;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityPk;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "de_tipo_vehiculo", schema = "despacho")
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class DeTipoVehiculo extends BaseEntityPk implements Serializable {

  private static final long serialVersionUID = 1L;

  @Column(name = "nombre", nullable = false, length = 50)
  private String nombre;

  @Column(name = "activo", nullable = false)
  private Boolean activo = true;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", length = 100)
  private String usuarioReg;
}
