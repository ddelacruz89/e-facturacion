package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDate;
import lombok.Data;

@Data
public class InMovimientoSearchCriteria {
  private LocalDate fechaInicio;
  private LocalDate fechaFin;

  /** null = todas las sucursales de la empresa */
  private Integer sucursalId;

  private Integer almacenId;
  private Integer productoId;
  private Integer tipoMovimientoId;
  private Integer numeroReferencia;
  private String lote;
  private Integer page;
  private Integer size;
}
