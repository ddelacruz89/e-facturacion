package com.braintech.eFacturador.dto.notificacion;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SgNotificacionTipoConfigPatchDTO {
  private Boolean paraLogin;
  private Boolean accesoRestringido;
  private Boolean activo;
}
