package com.braintech.eFacturador.jpa.despacho;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityPk;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "de_vehiculo", schema = "despacho")
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class DeVehiculo extends BaseEntityPk implements Serializable {

  private static final long serialVersionUID = 1L;

  @Column(name = "tipo_id", nullable = false)
  private Integer tipoId;

  @Column(name = "descripcion", nullable = false)
  private String descripcion;

  @Column(name = "placa", length = 20)
  private String placa;

  @Column(name = "activo", nullable = false)
  private Boolean activo = true;
}
