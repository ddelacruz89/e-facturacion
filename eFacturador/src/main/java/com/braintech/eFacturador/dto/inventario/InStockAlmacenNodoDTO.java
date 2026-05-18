package com.braintech.eFacturador.dto.inventario;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Nodo nivel 2 del árbol de stock: almacén con total y desglose por lote. */
@Data
@NoArgsConstructor
public class InStockAlmacenNodoDTO {

  private Integer almacenId;
  private String almacenNombre;

  /** Suma de cantidades de todos los lotes en este almacén. */
  private Integer totalCantidad;

  /** Lotes disponibles en este almacén. */
  private List<InStockLoteNodoDTO> lotes = new ArrayList<>();

  public InStockAlmacenNodoDTO(Integer almacenId, String almacenNombre) {
    this.almacenId = almacenId;
    this.almacenNombre = almacenNombre;
    this.totalCantidad = 0;
  }

  /** Constructor usado por la proyección JPQL con GROUP BY (SUM devuelve Long). */
  public InStockAlmacenNodoDTO(Integer almacenId, String almacenNombre, Long totalCantidad) {
    this.almacenId = almacenId;
    this.almacenNombre = almacenNombre;
    this.totalCantidad = totalCantidad == null ? 0 : totalCantidad.intValue();
  }

  public void agregarLote(String lote, Integer cantidad) {
    lotes.add(new InStockLoteNodoDTO(lote, cantidad));
    totalCantidad += (cantidad != null ? cantidad : 0);
  }
}
