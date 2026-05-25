package com.braintech.eFacturador.jpa.seguridad;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Registro individual de un aprobador dentro de una SgAprobacion. estadoId: PEN | APR | REC */
@Entity
@Table(name = "sg_aprobacion_detalle", schema = "seguridad")
@Getter
@Setter
@NoArgsConstructor
public class SgAprobacionDetalle implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "aprobacion_id", nullable = false)
  @JsonIgnoreProperties("detalle")
  private SgAprobacion aprobacion;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  /** Orden del aprobador (relevante en modo SECUENCIAL). */
  @Column(name = "nivel", nullable = false)
  private Integer nivel = 1;

  /** Aprobador asignado a este detalle. */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "aprobador_username", nullable = false)
  @JsonIgnoreProperties({"sucursalesAsignadas", "password", "manager"})
  private SgUsuario aprobador;

  /** true si fue resuelto desde el manager del solicitante. */
  @Column(name = "es_manager")
  private Boolean esManager = false;

  /** PEN | APR | REC */
  @Column(name = "estado_id", nullable = false, length = 20)
  private String estadoId = "PEN";

  @Column(name = "comentario", columnDefinition = "TEXT")
  private String comentario;

  @Column(name = "fecha_respuesta")
  private LocalDateTime fechaRespuesta;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;
}
