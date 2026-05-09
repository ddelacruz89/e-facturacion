package com.braintech.eFacturador.dto.inventario;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Stock de un producto en un almacen, desglosado por lote, con info de unidad. */
@Data
@NoArgsConstructor
public class InProductoLotesStockDTO {

  /** Suma de stock de todos los lotes. */
  private Integer totalDisponible;

  /** Cada lote con su cantidad disponible (solo los que tienen stock > 0). */
  private List<InLoteStockItemDTO> lotes;

  // ── Informacion de unidad ────────────────────────────────────────────────

  /** Cuantas unidades-fraccion hay por unidad-base (ej: 10 si es Caja x 10 Unidades). */
  private Integer cantidadUnidad;

  /** Nombre de la unidad base (ej: "Caja"). Null si el producto no tiene unidad configurada. */
  private String unidadNombre;

  /** Sigla de la unidad base (ej: "Cja"). */
  private String unidadSigla;

  /** Nombre de la unidad de fraccion (ej: "Unidad"). */
  private String unidadFraccionNombre;

  /** Sigla de la unidad de fraccion (ej: "Und"). */
  private String unidadFraccionSigla;

  /**
   * true cuando cantidadUnidad > 1, es decir el producto se maneja en unidades compuestas (ej: Caja
   * x 10 Unidades). false cuando es entero (cantidadUnidad == 1 o no configurado).
   */
  public boolean isEsFraccionario() {
    return cantidadUnidad != null && cantidadUnidad > 1;
  }
}
