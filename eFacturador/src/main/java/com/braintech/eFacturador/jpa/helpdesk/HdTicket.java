package com.braintech.eFacturador.jpa.helpdesk;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(schema = "helpdesk", name = "hd_ticket")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HdTicket {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  @Column(name = "titulo", nullable = false, length = 200)
  private String titulo;

  @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
  private String descripcion;

  @Column(name = "estado_id", nullable = false, length = 10)
  private String estadoId;

  @Column(name = "prioridad_id", nullable = false, length = 10)
  private String prioridadId;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", nullable = false, length = 100)
  private String usuarioReg;

  @Column(name = "fecha_limite", nullable = false)
  private LocalDateTime fechaLimite;

  @Column(name = "fecha_cierre")
  private LocalDateTime fechaCierre;

  @Column(name = "cerrado_por", length = 100)
  private String cerradoPor;
}
