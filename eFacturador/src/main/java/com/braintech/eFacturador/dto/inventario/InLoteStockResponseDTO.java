package com.braintech.eFacturador.dto.inventario;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respuesta del endpoint de stock por almacén de un lote. Incluye la metadata de conversión
 * unidad/fracción del producto para que el cliente pueda mostrar "5 cajas 3 unidades (53
 * unidades)".
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InLoteStockResponseDTO {
  /** Nombre de la unidad principal (ej. "Caja"). Null si el producto no tiene conversión. */
  private String unidadNombre;

  /** Nombre de la fracción (ej. "Unidad"). Null si el producto no tiene conversión. */
  private String fraccionNombre;

  /**
   * Cuántas fracciones hay en una unidad principal (ej. 10). Siempre >= 1. Valor 1 significa que no
   * hay conversión configurada.
   */
  private Integer fraccionCantidad;

  /** Stock desglosado por almacén, en fracciones. */
  private List<InLoteStockDTO> almacenes;
}
