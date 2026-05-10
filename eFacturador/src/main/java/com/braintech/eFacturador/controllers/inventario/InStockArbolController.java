package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import com.braintech.eFacturador.interfaces.inventario.InStockArbolService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
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
   * Retorna el inventario en estructura árbol: producto → almacén → lote.
   *
   * <p>Ejemplo de request:
   *
   * <pre>
   * POST /api/v1/inventario/stock-arbol/buscar
   * {
   *   "productoNombre": "Aspirina",   // opcional
   *   "almacenId": null,              // opcional
   *   "soloConStock": true            // default true
   * }
   * </pre>
   */
  @PostMapping("/buscar")
  public ResponseEntity<List<InStockProductoNodoDTO>> buscar(
      @RequestBody InStockArbolSearchCriteria criteria) {
    return ResponseEntity.ok(stockArbolService.buscarArbol(criteria));
  }
}
