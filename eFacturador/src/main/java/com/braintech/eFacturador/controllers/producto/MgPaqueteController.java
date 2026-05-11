package com.braintech.eFacturador.controllers.producto;

import com.braintech.eFacturador.dto.producto.MgPaqueteResumenDTO;
import com.braintech.eFacturador.dto.producto.MgPaqueteSearchCriteria;
import com.braintech.eFacturador.jpa.producto.MgPaquete;
import com.braintech.eFacturador.services.producto.MgPaqueteService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/producto/paquete")
@AllArgsConstructor
public class MgPaqueteController {

  private final MgPaqueteService paqueteService;

  /** Búsqueda con resumen — usado por el modal de búsqueda del frontend. */
  @PostMapping("/buscar")
  public ResponseEntity<List<MgPaqueteResumenDTO>> buscar(
      @RequestBody MgPaqueteSearchCriteria criteria) {
    return ResponseEntity.ok(paqueteService.buscar(criteria));
  }

  /** Carga completa (con ítems) para edición. */
  @GetMapping("/{id}")
  public ResponseEntity<MgPaquete> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(paqueteService.getById(id));
  }

  /** Crear o actualizar paquete. */
  @PostMapping
  public ResponseEntity<MgPaquete> save(@RequestBody MgPaquete paquete) {
    return ResponseEntity.ok(paqueteService.save(paquete));
  }

  @PutMapping("/{id}")
  public ResponseEntity<MgPaquete> update(
      @PathVariable Integer id, @RequestBody MgPaquete paquete) {
    paquete.setId(id);
    return ResponseEntity.ok(paqueteService.save(paquete));
  }
}
