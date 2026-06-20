package com.braintech.eFacturador.jpa.helpdesk;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(schema = "helpdesk", name = "hd_estado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HdEstado {

  @Id
  @Column(name = "id", length = 10)
  private String id;

  @Column(name = "nombre", nullable = false, length = 50)
  private String nombre;

  @Column(name = "descripcion", length = 200)
  private String descripcion;

  @Column(name = "orden", nullable = false)
  private Integer orden;

  @Column(name = "es_final", nullable = false)
  private Boolean esFinal;
}
