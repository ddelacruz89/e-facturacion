package com.braintech.eFacturador.jpa.SuperClass;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseEntityPkS {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  protected Integer id;

  @Column(name = "empresa_id")
  protected Integer empresaId;

  @Column(name = "secuencia")
  protected String secuencia;
}
