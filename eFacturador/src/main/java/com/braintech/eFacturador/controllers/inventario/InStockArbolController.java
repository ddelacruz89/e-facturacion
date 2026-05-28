package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InStockAlmacenNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockCriticoDTO;
import com.braintech.eFacturador.dto.inventario.InStockLoteNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import com.braintech.eFacturador.interfaces.inventario.InStockArbolService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/inventario/stock-arbol")
@AllArgsConstructor
public class InStockArbolController {

  private final InStockArbolService stockArbolService;

  /**
   * Nivel 1: productos con su cantidad total (GROUP BY producto).
   *
   * <p>POST /api/v1/inventario/stock-arbol/buscar
   */
  @PostMapping("/buscar")
  public ResponseEntity<Page<InStockProductoNodoDTO>> buscar(
      @RequestBody InStockArbolSearchCriteria criteria) {
    return ResponseEntity.ok(stockArbolService.buscarProductos(criteria));
  }

  /**
   * Nivel 2: almacenes con cantidad total para un producto (GROUP BY almacén). Se llama al expandir
   * una fila de producto en el frontend.
   *
   * <p>POST /api/v1/inventario/stock-arbol/producto/{productoId}/almacenes
   */
  @PostMapping("/producto/{productoId}/almacenes")
  public ResponseEntity<List<InStockAlmacenNodoDTO>> almacenesPorProducto(
      @PathVariable Integer productoId, @RequestBody InStockArbolSearchCriteria criteria) {
    return ResponseEntity.ok(stockArbolService.buscarAlmacenesPorProducto(productoId, criteria));
  }

  /**
   * Nivel 3: lotes de un producto en un almacén concreto. Se llama al expandir una fila de almacén
   * en el frontend.
   *
   * <p>POST /api/v1/inventario/stock-arbol/producto/{productoId}/almacen/{almacenId}/lotes
   */
  @PostMapping("/producto/{productoId}/almacen/{almacenId}/lotes")
  public ResponseEntity<List<InStockLoteNodoDTO>> lotesPorProductoAlmacen(
      @PathVariable Integer productoId,
      @PathVariable Integer almacenId,
      @RequestBody InStockArbolSearchCriteria criteria) {
    return ResponseEntity.ok(
        stockArbolService.buscarLotesPorProductoAlmacen(productoId, almacenId, criteria));
  }

  /**
   * Lista plana de producto-almacén cuyo stock total está por debajo del límite configurado.
   *
   * <p>GET /api/v1/inventario/stock-arbol/stock-critico
   */
  @GetMapping("/stock-critico")
  public ResponseEntity<List<InStockCriticoDTO>> stockCritico() {
    return ResponseEntity.ok(stockArbolService.getStockCritico());
  }
}
