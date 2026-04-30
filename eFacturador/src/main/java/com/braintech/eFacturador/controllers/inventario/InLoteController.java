package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InLoteResumenDTO;
import com.braintech.eFacturador.dto.inventario.InLoteSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InLoteStockResponseDTO;
import com.braintech.eFacturador.dto.inventario.InLoteUpdateDTO;
import com.braintech.eFacturador.interfaces.inventario.InLoteService;
import com.braintech.eFacturador.jpa.inventario.InLote;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/lotes")
@AllArgsConstructor
public class InLoteController {

  private final InLoteService inLoteService;

  /** Búsqueda paginada — devuelve resumen (mínima data). */
  @PostMapping("/buscar")
  public ResponseEntity<Page<InLoteResumenDTO>> buscar(@RequestBody InLoteSearchCriteria criteria) {
    return ResponseEntity.ok(inLoteService.searchByCriteria(criteria));
  }

  /** Carga el objeto completo por PK (lote + productoId). */
  @GetMapping("/{lote}/{productoId}")
  public ResponseEntity<InLote> getById(@PathVariable String lote, @PathVariable Long productoId) {
    InLote inLote = inLoteService.findById(lote, productoId);
    if (inLote == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(inLote);
  }

  /** Stock del lote desglosado por almacén, con metadata de conversión unidad/fracción. */
  @GetMapping("/{lote}/{productoId}/stock")
  public ResponseEntity<InLoteStockResponseDTO> getStock(
      @PathVariable String lote, @PathVariable Long productoId) {
    return ResponseEntity.ok(inLoteService.getStockPorAlmacen(lote, productoId));
  }

  /** Actualiza solo los campos editables (PK y tenant son inmutables). */
  @PutMapping("/{lote}/{productoId}")
  public ResponseEntity<InLote> update(
      @PathVariable String lote, @PathVariable Long productoId, @RequestBody InLoteUpdateDTO dto) {
    return ResponseEntity.ok(inLoteService.update(lote, productoId, dto));
  }

  @DeleteMapping("/{lote}/{productoId}")
  public ResponseEntity<Void> disable(@PathVariable String lote, @PathVariable Long productoId) {
    InLote existing = inLoteService.findById(lote, productoId);
    if (existing == null) return ResponseEntity.notFound().build();
    inLoteService.disableById(lote, productoId);
    return ResponseEntity.noContent().build();
  }
}
