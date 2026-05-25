package com.braintech.eFacturador.dto.seguridad;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SgConfigAprobacionSearchCriteria {
  private String tipoDocumento;
  private Boolean activo;
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
}
