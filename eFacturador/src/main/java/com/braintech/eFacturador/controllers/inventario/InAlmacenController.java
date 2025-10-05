package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.interfaces.inventario.InAlmacenService;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/almacenes")
public class InAlmacenController {
  @Autowired private InAlmacenService inAlmacenService;

  @GetMapping
  public List<InAlmacen> getAll() {
    return inAlmacenService.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<InAlmacen> getById(@PathVariable Integer id) {
    InAlmacen almacen = inAlmacenService.findById(id);
    if (almacen == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(almacen);
  }

  @PostMapping
  public ResponseEntity<InAlmacen> create(@RequestBody InAlmacen almacen) {
    InAlmacen saved = inAlmacenService.save(almacen);
    return ResponseEntity.ok(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<InAlmacen> update(
      @PathVariable Integer id, @RequestBody InAlmacen almacen) {
    InAlmacen existing = inAlmacenService.findById(id);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    almacen.setId(id);
    InAlmacen updated = inAlmacenService.save(almacen);
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    InAlmacen existing = inAlmacenService.findById(id);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    inAlmacenService.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
