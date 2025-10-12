package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.interfaces.seguridad.SgSucursalService;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.models.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seguridad/sucursales")
public class SgSucursalController {
  @Autowired private SgSucursalService sucursalService;

  @GetMapping
  public ResponseEntity<Response<?>> getAll() {
    Response<?> response = sucursalService.getFindByAll();
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Response<?>> getById(@PathVariable Integer id) {
    Response<?> response = sucursalService.getFindById(id);
    return ResponseEntity.ok(response);
  }

  @PostMapping
  public ResponseEntity<Response<?>> create(@RequestBody SgSucursal sucursal) {
    Response<?> response = sucursalService.save(sucursal);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Response<?>> update(
      @PathVariable Integer id, @RequestBody SgSucursal sucursal) {
    sucursal.setId(id);
    Response<?> response = sucursalService.save(sucursal);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Response<?>> disable(@PathVariable Integer id) {
    Response<?> response = sucursalService.disable(id);
    return ResponseEntity.ok(response);
  }
}
