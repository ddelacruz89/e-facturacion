package com.braintech.eFacturador.controllers.producto;

import com.braintech.eFacturador.jpa.producto.MgUnidadFraccion;
import com.braintech.eFacturador.services.producto.MgUnidadFraccionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/producto/unidad-fraccion")
@RequiredArgsConstructor
public class MgUnidadFraccionController {

  private final MgUnidadFraccionService unidadFraccionService;

  // Get all active records (activo = true)
  @GetMapping
  public List<MgUnidadFraccion> getAllActive() {
    return unidadFraccionService.getAllActive();
  }

  // Get all records including inactive
  @GetMapping("/all")
  public List<MgUnidadFraccion> getAll() {
    return unidadFraccionService.getAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<MgUnidadFraccion> getById(@PathVariable Integer id) {
    MgUnidadFraccion unidadFraccion = unidadFraccionService.getById(id);
    return ResponseEntity.ok(unidadFraccion);
  }

  @PostMapping
  public ResponseEntity<MgUnidadFraccion> create(@RequestBody MgUnidadFraccion unidadFraccion) {
    MgUnidadFraccion saved = unidadFraccionService.create(unidadFraccion);
    return ResponseEntity.ok(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<MgUnidadFraccion> update(
      @PathVariable Integer id, @RequestBody MgUnidadFraccion unidadFraccion) {
    MgUnidadFraccion updated = unidadFraccionService.update(id, unidadFraccion);
    return ResponseEntity.ok(updated);
  }

  // Soft delete - changes activo to false
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    unidadFraccionService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
