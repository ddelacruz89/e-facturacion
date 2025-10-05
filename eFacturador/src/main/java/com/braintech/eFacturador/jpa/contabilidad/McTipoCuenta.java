package com.braintech.eFacturador.jpa.contabilidad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;

@Table(name = "mc_tipo_cuenta", schema = "contabilidad")
@Entity
public class McTipoCuenta extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "tipoCuenta")
  private String tipoCuenta;

  @Column(name = "cr")
  private Boolean isCredito;
}
