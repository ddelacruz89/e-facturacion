package com.braintech.eFacturador.dto.notificacion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SgNotificacionTipoConfigDTO {

  private String tipoId;
  private String nombre;
  private String descripcion;
  private String modulo;
  private boolean paraLogin;

  /** True = solo usuarios con el tipo marcado en su perfil lo reciben. False = lo reciben todos. */
  private boolean accesoRestringido;

  private boolean activo;

  /** True si el usuario consultado tiene este tipo marcado en su perfil. */
  private boolean suscrito;
}
