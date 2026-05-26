package com.braintech.eFacturador.jpa.seguridad;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Un nivel/aprobador dentro de una SgConfigAprobacion. Cada fila representa un aprobador en el
 * flujo.
 */
@Entity
@Table(name = "sg_config_aprobacion_nivel", schema = "seguridad")
@Getter
@Setter
@NoArgsConstructor
public class SgConfigAprobacionNivel implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "config_id", nullable = false)
  @JsonIgnoreProperties("niveles")
  private SgConfigAprobacion config;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  /** Orden de aprobación (relevante solo en modo SECUENCIAL). */
  @Column(name = "nivel", nullable = false)
  private Integer nivel = 1;

  /**
   * Aprobador fijo. Null cuando usaManager = true: en ese caso se resuelve el manager del
   * solicitante en tiempo de ejecución.
   */
  @ManyToOne(fetch = FetchType.EAGER, optional = true)
  @JoinColumn(name = "aprobador_username", nullable = true)
  @JsonIgnoreProperties({"sucursalesAsignadas", "password", "manager", "sucursalId"})
  private SgUsuario aprobador;

  /**
   * Si true, el aprobador es el manager directo del solicitante (campo {@code manager} en
   * sg_usuario) — se resuelve en runtime.
   */
  @Column(name = "usa_manager", nullable = false)
  private Boolean usaManager = false;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;
}
