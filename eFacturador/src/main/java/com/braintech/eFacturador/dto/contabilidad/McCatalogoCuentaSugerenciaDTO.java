package com.braintech.eFacturador.dto.contabilidad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Sugerencia de código para la próxima sub-cuenta de un padre dado. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class McCatalogoCuentaSugerenciaDTO {
  private Integer nivel;
  private String nivel1;
  private String nivel2;
  private String nivel3;
  private String nivel4;
  private String cuenta;
  private Integer orden;
  private Boolean permiteMovimiento;
}
