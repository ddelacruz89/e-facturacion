package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDate;
import lombok.Data;

/** Criterios de búsqueda paginada para ajustes de inventario. */
@Data
public class InAjusteInventarioSearchCriteria {
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
  private String usuarioReg;
  private String estadoId;
  private Integer movimientoTipoId;
  private int page = 0;
  private int size = 20;
}
