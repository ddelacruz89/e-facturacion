package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InProductoLotesStockDTO;
import com.braintech.eFacturador.dto.inventario.InTransferenciaRequestDTO;
import com.braintech.eFacturador.interfaces.inventario.InTransferenciaService;
import com.braintech.eFacturador.models.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventario/transferencias")
@RequiredArgsConstructor
public class InTransferenciaController {

  private final InTransferenciaService inTransferenciaService;

  @GetMapping
  public ResponseEntity<Response<?>> getAllActive() {
    return ResponseEntity.ok(inTransferenciaService.getAllActive());
  }

  @GetMapping("/all")
  public ResponseEntity<Response<?>> getAll() {
    return ResponseEntity.ok(inTransferenciaService.getAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Response<?>> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(inTransferenciaService.getById(id));
  }

  @PostMapping
  public ResponseEntity<Response<?>> create(@RequestBody InTransferenciaRequestDTO requestDTO) {
    return ResponseEntity.ok(inTransferenciaService.create(requestDTO));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Response<?>> update(
      @PathVariable Integer id, @RequestBody InTransferenciaRequestDTO requestDTO) {
    return ResponseEntity.ok(inTransferenciaService.update(id, requestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Response<?>> disable(@PathVariable Integer id) {
    return ResponseEntity.ok(inTransferenciaService.disable(id));
  }

  /** GET /stock?productoId=X&almacenId=Y — Stock total del producto en el almacén. */
  @GetMapping("/stock")
  public ResponseEntity<Response<?>> getStock(
      @RequestParam Integer productoId, @RequestParam Integer almacenId) {
    return ResponseEntity.ok(
        inTransferenciaService.getStockProductoEnAlmacen(productoId, almacenId));
  }

  /**
   * GET /lotes-stock?productoId=X&almacenId=Y — Stock desglosado por lote. Devuelve totalDisponible
   * + lista de lotes con su cantidad individual (solo los que tienen stock > 0).
   */
  @GetMapping("/lotes-stock")
  public ResponseEntity<InProductoLotesStockDTO> getLotesStock(
      @RequestParam Integer productoId, @RequestParam Integer almacenId) {
    return ResponseEntity.ok(
        inTransferenciaService.getLotesConStockEnAlmacen(productoId, almacenId));
  }
}
