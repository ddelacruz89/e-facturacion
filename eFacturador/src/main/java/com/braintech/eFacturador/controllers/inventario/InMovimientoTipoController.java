package com.braintech.eFacturador.controllers.inventario;

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
}
