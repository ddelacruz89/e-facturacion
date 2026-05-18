package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de resumen para el catálogo global de tipos de movimiento. Solo los campos necesarios para
 * mostrar en el modal de búsqueda.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InMovimientoTipoResumenDTO {
  private Integer id;
  private String tipoMovimiento;
  private Boolean cr;
  private String modulo;
}
