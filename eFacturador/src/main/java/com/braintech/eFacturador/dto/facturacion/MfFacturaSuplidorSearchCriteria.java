package com.braintech.eFacturador.dto.facturacion;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Filtros para la búsqueda paginada de facturas suplidor. */
@Data
@NoArgsConstructor
public class MfFacturaSuplidorSearchCriteria {

  /** null → todas las sucursales de la empresa. */
  private Integer sucursalId;

  private Integer suplidorId;

  private String numeroFactura;

  /** null → sin filtro de estado. */
  private String estadoId;

  private LocalDate fechaInicio;
  private LocalDate fechaFin;
}
