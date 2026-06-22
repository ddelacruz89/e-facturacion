package com.braintech.eFacturador.jpa.helpdesk;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(schema = "helpdesk", name = "hd_ticket_comentario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HdTicketComentario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "ticket_id", nullable = false)
  private Integer ticketId;

  @Column(name = "contenido", nullable = false, columnDefinition = "TEXT")
  private String contenido;

  @Column(name = "es_interno", nullable = false)
  private Boolean esInterno;

  @Column(name = "autor", nullable = false, length = 100)
  private String autor;

  @Column(name = "origen", nullable = false, length = 10)
  private String origen;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;
}
