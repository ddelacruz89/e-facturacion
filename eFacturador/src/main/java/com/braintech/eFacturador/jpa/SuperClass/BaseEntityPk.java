package com.braintech.eFacturador.jpa.SuperClass;

import com.braintech.eFacturador.annotations.FieldDescription;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@MappedSuperclass
public class BaseEntityPk implements Serializable {
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  protected Integer id;

  @NotNull(message = "La empresa no puede ser nulo")
  @FieldDescription("Empresa")
  @Column(name = "empresa_id", updatable = false)
  protected Integer empresaId;

  @FieldDescription("Secuencia")
  @Column(name = "secuencia")
  protected Integer secuencia;

  protected BaseEntityPk(Integer id) {
    this.id = id;
  }

  public BaseEntityPk() {}
}
