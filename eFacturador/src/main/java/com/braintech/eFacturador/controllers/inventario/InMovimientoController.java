package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InMovimientoResumenDTO;
import com.braintech.eFacturador.dto.inventario.InMovimientoSearchCriteria;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoService;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/movimientos")
@RequiredArgsConstructor
public class InMovimientoController {

  private final InMovimientoService movimientoService;

  /** GET /{id} — obtener un movimiento por ID */
  @GetMapping("/{id}")
  public ResponseEntity<InMovimiento> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(movimientoService.findById(id));
  }

  /**
   * POST /buscar — búsqueda paginada con filtros opcionales. Body: { fechaInicio, fechaFin,
   * almacenId, productoId, tipoMovimientoId, numeroReferencia, lote, page, size }
   */
  @PostMapping("/buscar")
  public ResponseEntity<Page<InMovimientoResumenDTO>> buscar(
      @RequestBody InMovimientoSearchCriteria criteria) {
    return ResponseEntity.ok(movimientoService.buscar(criteria));
  }

  /**
   * GET /historial?productoId=X&almacenId=Y Historial completo de un producto en un almacén,
   * ordenado por fecha descendente.
   */
  @GetMapping("/historial")
  public ResponseEntity<List<InMovimientoResumenDTO>> historial(
      @RequestParam Integer productoId, @RequestParam Integer almacenId) {
    return ResponseEntity.ok(movimientoService.historialProductoAlmacen(productoId, almacenId));
  }

  /**
   * POST — registrar un movimiento individual (ajuste manual, corrección, etc.). Los movimientos
   * generados por órdenes de entrada, ventas o transferencias se registran internamente desde sus
   * propios services.
   */
  @PostMapping
  public ResponseEntity<InMovimiento> registrar(@RequestBody InMovimiento movimiento) {
    return ResponseEntity.ok(movimientoService.registrar(movimiento));
  }
}
