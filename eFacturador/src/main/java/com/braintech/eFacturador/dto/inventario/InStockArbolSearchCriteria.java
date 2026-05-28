package com.braintech.eFacturador.dto.inventario;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Criterios de búsqueda para el árbol de stock de inventario. */
@Data
@NoArgsConstructor
public class InStockArbolSearchCriteria {

  /**
   * Sucursal a consultar. Null = todas las sucursales de la empresa. El frontend envía el ID
   * elegido en el selector; si no selecciona ninguna, envía null.
   */
  private Integer sucursalId;

  /** Filtro por almacén específico (opcional). */
  private Integer almacenId;

  /** Filtro parcial por nombre de producto (opcional, case-insensitive). */
  private String productoNombre;

  /**
   * Si es true (por defecto), solo retorna registros con cantidad > 0. Si es false, retorna todos
   * incluyendo stock en cero.
   */
  private boolean soloConStock = true;

  /** Página a retornar (0-based). Solo aplica al nivel 1 (productos). */
  private int page = 0;

  /** Cantidad de productos por página. El frontend calcula el valor según la altura de pantalla. */
  private int size = 15;
}
