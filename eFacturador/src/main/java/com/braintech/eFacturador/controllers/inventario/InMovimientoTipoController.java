package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InMovimientoTipoResumenDTO;
import com.braintech.eFacturador.dto.inventario.InMovimientoTipoSearchCriteria;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoTipoService;
import com.braintech.eFacturador.jpa.inventario.InMovimientoTipo;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/movimientos-tipos")
@RequiredArgsConstructor
public class InMovimientoTipoController {

  private final InMovimientoTipoService tipoService;

  /** GET / — todos los tipos de movimiento. */
  @GetMapping
  public ResponseEntity<List<InMovimientoTipo>> getAll() {
    return ResponseEntity.ok(tipoService.findAll());
  }

  /**
   * GET /por-cr?cr=true — tipos crédito (entradas). GET /por-cr?cr=false — tipos débito (salidas).
   */
  @GetMapping("/por-cr")
  public ResponseEntity<List<InMovimientoTipo>> getByCr(@RequestParam Boolean cr) {
    return ResponseEntity.ok(tipoService.findByCr(cr));
  }

  /**
   * GET /por-modulo?modulo=AI — tipos cuyo campo modulo contiene el código dado como segmento.
   * Soporta valores compuestos como "AI-OE-OC".
   */
  @GetMapping("/por-modulo")
  public ResponseEntity<List<InMovimientoTipo>> getByModulo(@RequestParam String modulo) {
    return ResponseEntity.ok(tipoService.findByModulo(modulo));
  }

  /**
   * POST /buscar — Búsqueda para el modal. Devuelve solo id, tipoMovimiento, cr y modulo. Filtros
   * opcionales: q (nombre parcial), cr (true=entrada, false=salida).
   */
  @PostMapping("/buscar")
  public ResponseEntity<List<InMovimientoTipoResumenDTO>> buscar(
      @RequestBody InMovimientoTipoSearchCriteria criteria) {
    return ResponseEntity.ok(tipoService.buscar(criteria));
  }
}
