package com.braintech.eFacturador.controllers.producto;

import com.braintech.eFacturador.dto.producto.MgUnidadSimpleDTO;
import com.braintech.eFacturador.jpa.producto.MgUnidad;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.producto.MgUnidadService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/producto/unidad")
@RequiredArgsConstructor
public class MgUnidadController {

  private final MgUnidadService unidadService;

  // Get all active records (activo = true)
  @GetMapping("/activos")
  public List<MgUnidad> getAllActive() {
    return unidadService.getAllActive();
  }

  // Get all records including inactive
  @GetMapping("/all")
  public List<MgUnidad> getAll() {
    return unidadService.getAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<MgUnidad> getById(@PathVariable Integer id) {
    MgUnidad unidad = unidadService.getById(id);
    return ResponseEntity.ok(unidad);
  }

  @RequierePermiso(menuUrl = "/producto/unidad", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<MgUnidad> create(@RequestBody MgUnidad unidad) {
    MgUnidad saved = unidadService.create(unidad);
    return ResponseEntity.ok(saved);
  }

  @RequierePermiso(menuUrl = "/producto/unidad", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<MgUnidad> update(@PathVariable Integer id, @RequestBody MgUnidad unidad) {
    MgUnidad updated = unidadService.update(id, unidad);
    return ResponseEntity.ok(updated);
  }

  // Soft delete - changes activo to false
  @RequierePermiso(menuUrl = "/producto/unidad", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    unidadService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/resumen")
  public ResponseEntity<List<MgUnidadSimpleDTO>> getAllActiveSimple() {
    return ResponseEntity.ok(unidadService.getAllActiveSimple());
  }
}
