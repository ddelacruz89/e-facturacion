package com.braintech.eFacturador.controllers.inventario;

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
}
