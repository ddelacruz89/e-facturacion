package com.braintech.eFacturador.jpa.helpdesk;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(schema = "helpdesk", name = "hd_ticket_asignacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HdTicketAsignacion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "ticket_id", nullable = false)
  private Integer ticketId;

  @Column(name = "username_soporte", nullable = false, length = 20)
  private String usernameSoporte;

  @Column(name = "fecha_asignacion", nullable = false)
  private LocalDateTime fechaAsignacion;

  @Column(name = "asignado_por", nullable = false, length = 100)
  private String asignadoPor;

  @Column(name = "activo", nullable = false)
  private Boolean activo;
}
