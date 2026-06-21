package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.interfaces.seguridad.SgEmpresaIpPermitidaService;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresaIpPermitida;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/seguridad/ip-permitida")
@RequiredArgsConstructor
public class SgEmpresaIpPermitidaController {

  private final SgEmpresaIpPermitidaService service;

  @GetMapping
  public ResponseEntity<List<SgEmpresaIpPermitida>> getAll() {
    return ResponseEntity.ok(service.getAll());
  }

  @PostMapping
  public ResponseEntity<SgEmpresaIpPermitida> save(@RequestBody SgEmpresaIpPermitida ip) {
    return ResponseEntity.ok(service.save(ip));
  }

  @PatchMapping("/{id}/toggle")
  public ResponseEntity<SgEmpresaIpPermitida> toggleActivo(@PathVariable Integer id) {
    return ResponseEntity.ok(service.toggleActivo(id));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
