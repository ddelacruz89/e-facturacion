package com.braintech.eFacturador.jpa.SuperClass;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseEntityPk {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "empresa_id", updatable = false)
  @NotNull(message = "La empresa no puede ser nulo")
  private Integer empresaId;

  @Column(name = "secuencia")
  private Integer secuencia;
}
