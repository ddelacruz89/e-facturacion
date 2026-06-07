package com.braintech.eFacturador.jpa.notificacion;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "sg_notificacion_tipo_config", schema = "seguridad")
public class SgNotificacionTipoConfig {

  @Id
  @Column(name = "tipo_id", length = 50)
  private String tipoId;

  @Column(name = "nombre", length = 100, nullable = false)
  private String nombre;

  @Column(name = "descripcion", columnDefinition = "TEXT")
  private String descripcion;

  @Column(name = "modulo", length = 30, nullable = false)
  private String modulo;

  /** Si true, las notificaciones de este tipo aparecen como modal al iniciar sesión. */
  @Column(name = "para_login", nullable = false)
  private Boolean paraLogin = true;

  /**
   * Si true, solo los usuarios con el tipo marcado en su perfil reciben el aviso (acceso
   * restringido). Si false, lo reciben todos los usuarios del tenant.
   */
  @Column(name = "acceso_restringido", nullable = false)
  private Boolean accesoRestringido = false;

  @Column(name = "activo", nullable = false)
  private Boolean activo = true;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", length = 45)
  private String usuarioReg;
}
