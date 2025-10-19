package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgItbis;
import com.braintech.eFacturador.services.facturacion.MgItbisService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/facturacion/itbis")
@RequiredArgsConstructor
public class MgItbisController {

  private final MgItbisService mgItbisService;

  // Get all active records (activo = true)
  @GetMapping
  public List<MgItbis> getAllActive() {
    return mgItbisService.getAllActive();
  }

  // Get all records including inactive
  @GetMapping("/all")
  public List<MgItbis> getAll() {
    return mgItbisService.getAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<MgItbis> getById(@PathVariable Integer id) {
    MgItbis itbis = mgItbisService.getById(id);
    return ResponseEntity.ok(itbis);
  }

  @PostMapping
  public ResponseEntity<MgItbis> create(@RequestBody MgItbis itbis) {
    MgItbis saved = mgItbisService.create(itbis);
    return ResponseEntity.ok(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<MgItbis> update(@PathVariable Integer id, @RequestBody MgItbis itbis) {
    MgItbis updated = mgItbisService.update(id, itbis);
    return ResponseEntity.ok(updated);
  }

  // Soft delete - changes activo to false
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    mgItbisService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
