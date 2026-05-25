package com.braintech.eFacturador.dto.seguridad;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SgAprobacionSearchCriteria {
  private String tipoDocumento;
  private Integer documentoId;

  /** Filtrar por estado global: PEN | APR | REC | CAN */
  private String estadoId;

  private String solicitante;

  /** Si true, devuelve solo las aprobaciones donde el usuario actual es aprobador. */
  private Boolean soloMisPendientes;

  private LocalDate fechaInicio;
  private LocalDate fechaFin;
}
