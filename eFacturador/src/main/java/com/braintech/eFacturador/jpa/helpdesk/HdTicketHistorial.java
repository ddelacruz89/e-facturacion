package com.braintech.eFacturador.jpa.helpdesk;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(schema = "helpdesk", name = "hd_ticket_historial")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HdTicketHistorial {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "ticket_id", nullable = false)
  private Integer ticketId;

  @Column(name = "estado_anterior", length = 10)
  private String estadoAnterior;

  @Column(name = "estado_nuevo", nullable = false, length = 10)
  private String estadoNuevo;

  @Column(name = "observacion", length = 500)
  private String observacion;

  @Column(name = "fecha", nullable = false)
  private LocalDateTime fecha;

  @Column(name = "usuario", nullable = false, length = 100)
  private String usuario;
}
