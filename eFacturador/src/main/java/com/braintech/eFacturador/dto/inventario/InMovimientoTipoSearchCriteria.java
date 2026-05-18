package com.braintech.eFacturador.dto.inventario;

import lombok.Data;

/** Criterios opcionales para la búsqueda modal de tipos de movimiento. */
@Data
public class InMovimientoTipoSearchCriteria {
  /** Filtro parcial sobre el nombre del tipo (LIKE %q%). */
  private String q;

  /**
   * Efecto sobre el stock: {@code true} = crédito/entrada, {@code false} = débito/salida. {@code
   * null} = todos.
   */
  private Boolean cr;
}
