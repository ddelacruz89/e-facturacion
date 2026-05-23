package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfItbisRequestDTO;
import com.braintech.eFacturador.jpa.facturacion.MfItbis;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.facturacion.MfItbisService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/facturacion/mf-itbis")
@AllArgsConstructor
public class MfItbisController {

  private final MfItbisService service;

  @GetMapping
  public ResponseEntity<List<MfItbis>> findAll() {
    return ResponseEntity.ok(service.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<MfItbis> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(service.findById(id));
  }

  @RequierePermiso(menuUrl = "/mf-itbis", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<MfItbis> save(@RequestBody MfItbisRequestDTO dto) {
    return ResponseEntity.ok(service.save(dto));
  }

  @RequierePermiso(menuUrl = "/mf-itbis", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<MfItbis> update(
      @PathVariable Integer id, @RequestBody MfItbisRequestDTO dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }
}
