package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InSuplidorProductoRequestDTO;
import com.braintech.eFacturador.dto.inventario.InSuplidorSearchCriteria;
import com.braintech.eFacturador.interfaces.inventario.InSuplidorService;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.braintech.eFacturador.models.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventario/suplidores")
@RequiredArgsConstructor
public class InSuplidorController {

  private final InSuplidorService inSuplidorService;

  @GetMapping
  public ResponseEntity<Response<?>> getActive() {
    return ResponseEntity.ok(inSuplidorService.getAllActive());
  }

  @GetMapping("/all")
  public ResponseEntity<Response<?>> getAll() {
    return ResponseEntity.ok(inSuplidorService.getAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Response<?>> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(inSuplidorService.getById(id));
  }

  @GetMapping("/rnc/{rnc}")
  public ResponseEntity<Response<?>> getByRnc(@PathVariable String rnc) {
    return ResponseEntity.ok(inSuplidorService.getByRnc(rnc));
  }

  @PostMapping
  public ResponseEntity<Response<?>> create(@RequestBody InSuplidor suplidor) {
    return ResponseEntity.ok(inSuplidorService.create(suplidor));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Response<?>> update(
      @PathVariable Integer id, @RequestBody InSuplidor suplidor) {
    return ResponseEntity.ok(inSuplidorService.update(id, suplidor));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Response<?>> disable(@PathVariable Integer id) {
    return ResponseEntity.ok(inSuplidorService.disable(id));
  }

  @GetMapping("/resumen")
  public ResponseEntity<Response<?>> getAllActiveSimple() {
    return ResponseEntity.ok(inSuplidorService.getAllActiveSimple());
  }

  // -------------------------------------------------------------------------
  // Búsqueda paginada
  // -------------------------------------------------------------------------

  @PostMapping("/buscar")
  public ResponseEntity<Response<?>> buscar(@RequestBody InSuplidorSearchCriteria criteria) {
    return ResponseEntity.ok(inSuplidorService.buscar(criteria));
  }

  // -------------------------------------------------------------------------
  // Productos del suplidor
  // -------------------------------------------------------------------------

  @GetMapping("/{suplidorId}/productos")
  public ResponseEntity<Response<?>> getProductos(@PathVariable Integer suplidorId) {
    return ResponseEntity.ok(inSuplidorService.getProductos(suplidorId));
  }

  @PostMapping("/{suplidorId}/productos")
  public ResponseEntity<Response<?>> addProducto(
      @PathVariable Integer suplidorId, @RequestBody InSuplidorProductoRequestDTO request) {
    return ResponseEntity.ok(inSuplidorService.addProducto(suplidorId, request));
  }

  @PutMapping("/{suplidorId}/productos/{id}")
  public ResponseEntity<Response<?>> updateProductoPrecio(
      @PathVariable Integer suplidorId,
      @PathVariable Integer id,
      @RequestBody InSuplidorProductoRequestDTO request) {
    return ResponseEntity.ok(inSuplidorService.updateProductoPrecio(suplidorId, id, request));
  }

  @DeleteMapping("/{suplidorId}/productos/{id}")
  public ResponseEntity<Response<?>> removeProducto(
      @PathVariable Integer suplidorId, @PathVariable Integer id) {
    return ResponseEntity.ok(inSuplidorService.removeProducto(suplidorId, id));
  }
}
