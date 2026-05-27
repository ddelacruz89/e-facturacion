package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDate;
import lombok.Data;

@Data
public class InReportesCriteria {
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
  private Integer productoId;
  private Integer sucursalId; // null = todas las sucursales
  private Integer anio; // para comparativo; default = año actual si null
  private Integer top; // para top productos; default 10 si null
}
