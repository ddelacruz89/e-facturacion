package com.braintech.eFacturador.dto.inventario;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Nodo nivel 1 del árbol de stock: producto con total global y desglose por almacén. */
@Data
@NoArgsConstructor
public class InStockProductoNodoDTO {

  private Integer productoId;
  private String productoNombre;

  /** Suma de cantidades en todos los almacenes (sin importar almacén ni lote). */
  private Integer totalCantidad;

  /** Almacenes donde este producto tiene stock. */
  private List<InStockAlmacenNodoDTO> almacenes = new ArrayList<>();

  public InStockProductoNodoDTO(Integer productoId, String productoNombre) {
    this.productoId = productoId;
    this.productoNombre = productoNombre;
    this.totalCantidad = 0;
  }

  /** Constructor usado por la proyección JPQL con GROUP BY (SUM devuelve Long). */
  public InStockProductoNodoDTO(Integer productoId, String productoNombre, Long totalCantidad) {
    this.productoId = productoId;
    this.productoNombre = productoNombre;
    this.totalCantidad = totalCantidad == null ? 0 : totalCantidad.intValue();
  }

  public void agregarCantidad(Integer cantidad) {
    totalCantidad += (cantidad != null ? cantidad : 0);
  }
}
