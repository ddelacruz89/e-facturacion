package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Configuración de aprobación por tipo de documento. Define quién aprueba qué documentos y con qué
 * modo (SECUENCIAL, SIN_ORDEN, AL_MENOS_UNO).
 */
@Entity
@Table(
    name = "sg_config_aprobacion",
    schema = "seguridad",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_config_apr_tipo",
            columnNames = {"empresa_id", "tipo_documento"}))
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
public class SgConfigAprobacion extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  /** Código del tipo de documento: REQUISICION, ORDEN_COMPRA, etc. */
  @Column(name = "tipo_documento", nullable = false, length = 50)
  private String tipoDocumento;

  /** Nombre descriptivo de esta configuración. */
  @Column(name = "nombre", nullable = false, length = 200)
  private String nombre;

  /**
   * Modo de aprobación:
   *
   * <ul>
   *   <li>SECUENCIAL – aprobadores en orden (nivel 1 → 2 → ...)
   *   <li>SIN_ORDEN – todos deben aprobar, en cualquier orden
   *   <li>AL_MENOS_UNO – basta con que uno apruebe
   * </ul>
   */
  @Column(name = "modo_aprobacion", nullable = false, length = 20)
  private String modoAprobacion = "SECUENCIAL";

  @OneToMany(
      mappedBy = "config",
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  @JsonIgnoreProperties("config")
  private List<SgConfigAprobacionNivel> niveles = new ArrayList<>();
}
