package com.braintech.eFacturador.jpa.helpdesk;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(schema = "helpdesk", name = "hd_ticket_adjunto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HdTicketAdjunto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "ticket_id", nullable = false)
  private Integer ticketId;

  @Column(name = "comentario_id")
  private Integer comentarioId;

  @Column(name = "nombre_archivo", nullable = false, length = 255)
  private String nombreArchivo;

  @Column(name = "ruta", nullable = false, length = 500)
  private String ruta;

  @Column(name = "proveedor", nullable = false, length = 10)
  private String proveedor;

  @Column(name = "mime_type", nullable = false, length = 100)
  private String mimeType;

  @Column(name = "tamanio_bytes", nullable = false)
  private Long tamanioBytes;

  @Column(name = "autor", nullable = false, length = 100)
  private String autor;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;
}
