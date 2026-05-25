package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Solicitud de aprobación de un documento concreto. Creada automáticamente por el service del
 * módulo cuando el documento requiere aprobación. estadoId: PEN | APR | REC | CAN.
 */
@Entity
@Table(name = "sg_aprobacion", schema = "seguridad")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
@NoArgsConstructor
public class SgAprobacion extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  /** Código del tipo de documento: REQUISICION, ORDEN_COMPRA, etc. */
  @Column(name = "tipo_documento", nullable = false, length = 50)
  private String tipoDocumento;

  /** PK interna del documento que se está aprobando. */
  @Column(name = "documento_id", nullable = false)
  private Integer documentoId;

  /** Configuración de aprobación aplicada al crear esta solicitud. */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "config_id", nullable = false)
  @JsonIgnoreProperties("niveles")
  private SgConfigAprobacion config;

  /** Usuario que originó la solicitud. */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "solicitante_username", nullable = false)
  @JsonIgnoreProperties({"sucursalesAsignadas", "password", "manager"})
  private SgUsuario solicitante;

  /**
   * Modo copiado de la config en el momento de crear la solicitud, para que cambios futuros en la
   * config no afecten solicitudes en curso.
   */
  @Column(name = "modo_aprobacion", nullable = false, length = 20)
  private String modoAprobacion;

  /** Comentario al resolver (aprobar o rechazar). */
  @Column(name = "comentario_final", columnDefinition = "TEXT")
  private String comentarioFinal;

  @Column(name = "fecha_solicitud", nullable = false)
  private LocalDateTime fechaSolicitud;

  /** Fecha en que se resolvió (APR o REC). */
  @Column(name = "fecha_resolucion")
  private LocalDateTime fechaResolucion;

  /**
   * Líneas de aprobación (una por aprobador). estadoId en BaseSucursal = estado global
   * PEN/APR/REC/CAN.
   */
  @OneToMany(
      mappedBy = "aprobacion",
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  @JsonIgnoreProperties("aprobacion")
  private List<SgAprobacionDetalle> detalle = new ArrayList<>();
}
