package com.braintech.eFacturador.jpa.helpdesk;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(schema = "helpdesk", name = "hd_prioridad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HdPrioridad {

  @Id
  @Column(name = "id", length = 10)
  private String id;

  @Column(name = "nombre", nullable = false, length = 50)
  private String nombre;

  @Column(name = "sla_horas", nullable = false)
  private Integer slaHoras;

  @Column(name = "orden", nullable = false)
  private Integer orden;
}
