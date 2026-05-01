package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InAjusteInventarioRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO;
import com.braintech.eFacturador.dto.inventario.InStockActualDTO;
import com.braintech.eFacturador.interfaces.inventario.InAjusteInventarioService;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventario;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/ajustes")
@RequiredArgsConstructor
public class InAjusteInventarioController {

  private final InAjusteInventarioService ajusteService;

  /**
   * POST /aplicar — Aplica un ajuste de inventario. Body: { almacenId, observacion, detalles: [{
   * productoId, lote, cantidadActual, cantidadNueva }] }
   */
  @PostMapping("/aplicar")
  public ResponseEntity<InAjusteInventario> aplicar(
      @RequestBody InAjusteInventarioRequestDTO request) {
    return ResponseEntity.ok(ajusteService.aplicar(request));
  }

  /** GET /{id} — Obtiene un ajuste completo con sus detalles. */
  @GetMapping("/{id}")
  public ResponseEntity<InAjusteInventario> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(ajusteService.findById(id));
  }

  /** GET /historial?almacenId=X — Lista el historial de ajustes de un almacén. */
  @GetMapping("/historial")
  public ResponseEntity<List<InAjusteInventarioResumenDTO>> historial(
      @RequestParam Integer almacenId) {
    return ResponseEntity.ok(ajusteService.findByAlmacen(almacenId));
  }

  /**
   * GET /stock?productoId=X&almacenId=Y&lote=Z — Consulta el stock actual de un producto. El
   * parámetro lote es opcional (null = sin lote).
   */
  @GetMapping("/stock")
  public ResponseEntity<InStockActualDTO> stock(
      @RequestParam Integer productoId,
      @RequestParam Integer almacenId,
      @RequestParam(required = false) String lote) {
    return ResponseEntity.ok(ajusteService.getStockActual(productoId, almacenId, lote));
  }

  /**
   * GET /lotes?productoId=X&almacenId=Y — Lotes con stock > 0 para un producto en un almacén.
   * Devuelve lista de strings (códigos de lote). null en la lista = sin lote.
   */
  @GetMapping("/lotes")
  public ResponseEntity<List<String>> lotes(
      @RequestParam Integer productoId, @RequestParam Integer almacenId) {
    return ResponseEntity.ok(ajusteService.getLotesByProductoAndAlmacen(productoId, almacenId));
  }
}
