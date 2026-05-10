package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.dto.facturacion.MgRetencionItbisRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MgRetencionItbisResumenDTO;
import com.braintech.eFacturador.jpa.general.MgRetencionItbis;
import com.braintech.eFacturador.services.facturacion.MgRetencionItbisService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/facturacion/retenciones-itbis")
@AllArgsConstructor
public class MgRetencionItbisController {

  private final MgRetencionItbisService service;

  /** Todos los registros como resumen — para listados y dropdowns. */
  @GetMapping
  public ResponseEntity<List<MgRetencionItbisResumenDTO>> getAll() {
    return ResponseEntity.ok(service.findAll());
  }

  /**
   * Filtrado por tipo: ?tipo=ITBIS | ?tipo=ISR Útil para cargar solo las retenciones relevantes
   * según el contexto.
   */
  @GetMapping("/por-tipo")
  public ResponseEntity<List<MgRetencionItbisResumenDTO>> getByTipo(@RequestParam String tipo) {
    return ResponseEntity.ok(service.findByTipo(tipo));
  }

  /** Objeto completo por ID — para cargar el formulario de edición. */
  @GetMapping("/{id}")
  public ResponseEntity<MgRetencionItbis> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(service.findById(id));
  }

  /** Crear nuevo registro. */
  @PostMapping
  public ResponseEntity<MgRetencionItbis> save(@RequestBody MgRetencionItbisRequestDTO dto) {
    return ResponseEntity.ok(service.save(dto));
  }

  /** Actualizar registro existente. */
  @PutMapping("/{id}")
  public ResponseEntity<MgRetencionItbis> update(
      @PathVariable Integer id, @RequestBody MgRetencionItbisRequestDTO dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  /** Eliminar registro. */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
