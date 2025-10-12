package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEmpesaPk;
import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mg_categoria", schema = "producto")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@IdClass(BaseEmpesaPk.class)
public class MgCategoria extends BaseEntity {
  @Id
  @Column(name = "id")
  private Integer id;

  @Id
  @Column(name = "empresa_id")
  private Integer empresaId;

  @Column(name = "categoria", nullable = false)
  private String categoria;

  @Column(name = "modificable", nullable = false)
  private Boolean modificable;

  @Column(name = "tieneModulo", nullable = false)
  private Boolean tieneModulo;

  @Column(name = "llevaMedida", nullable = false)
  private Boolean llevaMedida;
}
