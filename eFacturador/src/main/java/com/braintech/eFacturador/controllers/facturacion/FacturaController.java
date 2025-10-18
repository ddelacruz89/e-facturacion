package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.services.facturacion.FacturacionServices;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("api/v1/facturacion/facturas")
@RestController
@RequiredArgsConstructor
public class FacturaController {
  private final FacturacionServices facturacionServices;

  // Get all active records (estadoId = 'ACT')
  @GetMapping
  public List<MfFactura> getAll() {
    return facturacionServices.getAllActive();
  }

  // Get all records including inactive
  @GetMapping("/all")
  public List<MfFactura> getAllIncludingInactive() {
    return facturacionServices.getAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<MfFactura> getById(@PathVariable Integer id) {
    MfFactura factura = facturacionServices.getById(id);
    return ResponseEntity.ok(factura);
  }

  @GetMapping("/numero/{numeroFactura}")
  public ResponseEntity<MfFactura> getByNumeroFactura(@PathVariable Integer numeroFactura) {
    MfFactura factura = facturacionServices.getByNumeroFactura(numeroFactura);
    return ResponseEntity.ok(factura);
  }

  @PostMapping
  public ResponseEntity<MfFactura> create(@RequestBody MfFactura factura) {
    MfFactura saved = facturacionServices.create(factura);
    return ResponseEntity.ok(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<MfFactura> update(
      @PathVariable Integer id, @RequestBody MfFactura factura) {
    MfFactura updated = facturacionServices.update(id, factura);
    return ResponseEntity.ok(updated);
  }

  // Soft delete - changes estadoId to 'INA'
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    facturacionServices.disable(id);
    return ResponseEntity.noContent().build();
  }
}
