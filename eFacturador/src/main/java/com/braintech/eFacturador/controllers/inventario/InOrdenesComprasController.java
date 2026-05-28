package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InOrdenesComprasRequestDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSearchCriteria;
import com.braintech.eFacturador.interfaces.inventario.InOrdenesComprasService;
import com.braintech.eFacturador.jpa.inventario.InOrdenesCompras;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventario/ordenes-compras")
@RequiredArgsConstructor
public class InOrdenesComprasController {

  private final InOrdenesComprasService inOrdenesComprasService;

  @GetMapping
  public ResponseEntity<Response<?>> getAllActive() {
    return ResponseEntity.ok(inOrdenesComprasService.getAllActive());
  }

  @GetMapping("/all")
  public ResponseEntity<Response<?>> getAll() {
    return ResponseEntity.ok(inOrdenesComprasService.getAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Response<?>> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(inOrdenesComprasService.getById(id));
  }

  @GetMapping("/debug/{id}")
  public ResponseEntity<Response<?>> getByIdDebug(@PathVariable Integer id) {
    return ResponseEntity.ok(inOrdenesComprasService.getByIdDebug(id));
  }

  @RequierePermiso(menuUrl = "/inventario/ordenes-compras", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<Response<?>> create(@RequestBody InOrdenesComprasRequestDTO requestDTO) {
    return ResponseEntity.ok(inOrdenesComprasService.create(requestDTO));
  }

  @RequierePermiso(menuUrl = "/inventario/ordenes-compras", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<Response<?>> update(
      @PathVariable Integer id, @RequestBody InOrdenesCompras ordenCompra) {
    return ResponseEntity.ok(inOrdenesComprasService.update(id, ordenCompra));
  }

  @RequierePermiso(menuUrl = "/inventario/ordenes-compras", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Response<?>> disable(@PathVariable Integer id) {
    return ResponseEntity.ok(inOrdenesComprasService.disable(id));
  }

  @GetMapping("/resumen")
  public ResponseEntity<Response<?>> getAllActiveSimple() {
    return ResponseEntity.ok(inOrdenesComprasService.getAllActiveSimple());
  }

  @PostMapping("/buscar")
  public ResponseEntity<Response<?>> searchByCriteria(
      @RequestBody InOrdenesComprasSearchCriteria criteria) {
    return ResponseEntity.ok(inOrdenesComprasService.searchByCriteria(criteria));
  }

  @RequierePermiso(menuUrl = "/inventario/orden-entrada", accion = Accion.ESCRIBIR)
  @PostMapping("/{id}/convertir-orden-entrada")
  public ResponseEntity<Response<?>> convertirAOrdenEntrada(
      @PathVariable Integer id, @RequestParam Integer almacenId) {
    return ResponseEntity.ok(inOrdenesComprasService.convertirAOrdenEntrada(id, almacenId));
  }
}
