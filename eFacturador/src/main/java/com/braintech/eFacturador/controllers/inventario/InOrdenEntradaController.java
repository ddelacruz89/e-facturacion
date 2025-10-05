package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.interfaces.inventario.InOrdenEntradaService;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/orden-entrada")
public class InOrdenEntradaController {
  @Autowired private InOrdenEntradaService inOrdenEntradaService;

  @GetMapping
  public List<InOrdenEntrada> getAll() {
    return inOrdenEntradaService.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<InOrdenEntrada> getById(@PathVariable Integer id) {
    InOrdenEntrada ordenEntrada = inOrdenEntradaService.findById(id);
    if (ordenEntrada == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(ordenEntrada);
  }

  @PostMapping
  public ResponseEntity<InOrdenEntrada> create(@RequestBody InOrdenEntrada ordenEntrada) {
    InOrdenEntrada saved = inOrdenEntradaService.save(ordenEntrada);
    return ResponseEntity.ok(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<InOrdenEntrada> update(
      @PathVariable Integer id, @RequestBody InOrdenEntrada ordenEntrada) {
    InOrdenEntrada existing = inOrdenEntradaService.findById(id);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    ordenEntrada.setId(id);
    InOrdenEntrada updated = inOrdenEntradaService.save(ordenEntrada);
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    InOrdenEntrada existing = inOrdenEntradaService.findById(id);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }
    inOrdenEntradaService.disableById(id);
    return ResponseEntity.noContent().build();
  }
}
