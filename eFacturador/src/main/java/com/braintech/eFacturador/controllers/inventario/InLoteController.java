package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.interfaces.inventario.InLoteService;
import com.braintech.eFacturador.jpa.inventario.InLote;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventario/lotes")
public class InLoteController {
  @Autowired private InLoteService inLoteService;

  @GetMapping
  public List<InLote> getAll() {
    return inLoteService.findAll();
  }

  @GetMapping("/{lote}/{productoId}")
  public ResponseEntity<InLote> getById(@PathVariable String lote, @PathVariable Long productoId) {
    InLote inLote = inLoteService.findById(lote, productoId);
    if (inLote == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(inLote);
  }

  @PostMapping
  public ResponseEntity<InLote> create(@RequestBody InLote inLote) {
    InLote saved = inLoteService.save(inLote);
    return ResponseEntity.ok(saved);
  }

  @DeleteMapping("/{lote}/{productoId}")
  public ResponseEntity<Void> disable(@PathVariable String lote, @PathVariable Long productoId) {
    InLote existing = inLoteService.findById(lote, productoId);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    inLoteService.disableById(lote, productoId);
    return ResponseEntity.noContent().build();
  }
}
