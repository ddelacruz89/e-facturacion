package com.braintech.eFacturador.dto.notificacion;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SgNotificacionDTO {

  private Integer id;
  private Integer empresaId;
  private Integer sucursalId;

  private String modulo;
  private String tipo;
  private String titulo;
  private String descripcion;

  private Integer referenciaId;
  private String referenciaTipo;

  private Map<String, Object> payload;

  private String estadoId;
  private LocalDateTime fechaReg;
  private String usuarioReg;

  /** True si el usuario autenticado ya marcó esta notificación como vista. */
  private boolean visto;

  /** True si esta notificación debe mostrarse como modal bloqueante al iniciar sesión. */
  private boolean paraLogin;

  /** Si true, reaparece en cada login hasta fechaExpiracion aunque el usuario ya la confirmó. */
  private boolean repetirLogin;

  /** Fecha límite de aparición en el login. NULL = sin límite. */
  private java.time.LocalDateTime fechaExpiracion;

  /** Usernames de destinatarios específicos. Vacío = aplica regla de tipo (acceso_restringido). */
  private java.util.List<String> destinatarios;
}
