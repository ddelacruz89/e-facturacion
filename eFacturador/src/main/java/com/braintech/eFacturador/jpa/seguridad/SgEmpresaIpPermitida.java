package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "sg_empresa_ip_permitida",
    schema = "seguridad",
    uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "ip_origen"}))
@Getter
@Setter
@NoArgsConstructor
public class SgEmpresaIpPermitida extends BaseEntity {

  @Column(name = "ip_origen", nullable = false, length = 45)
  private String ipOrigen;

  @Column(name = "descripcion", length = 100)
  private String descripcion;
}
