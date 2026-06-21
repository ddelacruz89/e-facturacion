package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.interfaces.seguridad.SgSucursalService;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seguridad/sucursales")
public class SgSucursalController {
  @Autowired private SgSucursalService sucursalService;

  @GetMapping
  public ResponseEntity<Response<?>> getActive() {
    Response<?> response = sucursalService.getFindAllActive();
    return ResponseEntity.ok(response);
  }

  @GetMapping("/all")
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
  @RequierePermiso(menuUrl = "/empresa", accion = Accion.ESCRIBIR)
  public ResponseEntity<Response<?>> create(@RequestBody SgSucursal sucursal) {
    Response<?> response = sucursalService.save(sucursal);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}")
  @RequierePermiso(menuUrl = "/empresa", accion = Accion.ESCRIBIR)
  public ResponseEntity<Response<?>> update(
      @PathVariable Integer id, @RequestBody SgSucursal sucursal) {
    sucursal.setId(id);
    Response<?> response = sucursalService.save(sucursal);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @RequierePermiso(menuUrl = "/empresa", accion = Accion.ELIMINAR)
  public ResponseEntity<Response<?>> disable(@PathVariable Integer id) {
    Response<?> response = sucursalService.disable(id);
    return ResponseEntity.ok(response);
  }
}
