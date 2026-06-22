package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representa un grant de acceso de soporte otorgado a un usuario de soporte para acceder a un
 * tenant específico en modo solo-lectura.
 *
 * <p>Esta tabla es escrita exclusivamente por el sistema de management. eFacturador solo la lee
 * durante el flujo de login de usuarios soporte.
 *
 * <p>Invariantes:
 *
 * <ul>
 *   <li>Solo puede existir un registro activo por par (empresaId, usernameSoporte).
 *   <li>El acceso es válido únicamente si {@code activo=true} y {@code fechaExpiracion} es futura.
 *   <li>El usuario referenciado en {@code usernameSoporte} debe tener {@code es_soporte=true}.
 * </ul>
 */
@Entity
@Table(name = "sg_acceso_soporte", schema = "seguridad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SgAccesoSoporte {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  /** ID del tenant (empresa) al que se otorga acceso de soporte. */
  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  /** Username del usuario de soporte (sg_usuario.username, es_soporte=TRUE). */
  @Column(name = "username_soporte", nullable = false, length = 20)
  private String usernameSoporte;

  /** Identificador del operador en el management system que otorgó el acceso. */
  @Column(name = "otorgado_por", nullable = false, length = 100)
  private String otorgadoPor;

  /** El acceso deja de ser válido en esta fecha/hora. */
  @Column(name = "fecha_expiracion", nullable = false)
  private LocalDateTime fechaExpiracion;

  /** false = revocado manualmente. También se verifica fechaExpiracion. */
  @Column(name = "activo", nullable = false)
  private Boolean activo = true;

  /** Notas opcionales sobre el motivo del acceso. */
  @Column(name = "observaciones", length = 500)
  private String observaciones;

  @Column(name = "fecha_reg", nullable = false, updatable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", nullable = false, updatable = false, length = 100)
  private String usuarioReg;
}
