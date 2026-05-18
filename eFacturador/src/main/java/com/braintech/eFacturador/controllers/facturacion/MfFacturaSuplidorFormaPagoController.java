package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorFormaPagoRequestDTO;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorFormaPago;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.facturacion.MfFacturaSuplidorFormaPagoService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/facturacion/formas-pago-suplidor")
@AllArgsConstructor
public class MfFacturaSuplidorFormaPagoController {

  private final MfFacturaSuplidorFormaPagoService service;

  @GetMapping
  public ResponseEntity<List<MfFacturaSuplidorFormaPago>> findAll() {
    return ResponseEntity.ok(service.findAll());
  }

  @GetMapping("/activos")
  public ResponseEntity<List<MfFacturaSuplidorFormaPago>> findActivos() {
    return ResponseEntity.ok(service.findActivos());
  }

  @GetMapping("/{id}")
  public ResponseEntity<MfFacturaSuplidorFormaPago> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(service.findById(id));
  }

  @RequierePermiso(menuUrl = "/formas-pago-suplidor", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<MfFacturaSuplidorFormaPago> save(
      @RequestBody MfFacturaSuplidorFormaPagoRequestDTO dto) {
    return ResponseEntity.ok(service.save(dto));
  }

  @RequierePermiso(menuUrl = "/formas-pago-suplidor", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<MfFacturaSuplidorFormaPago> update(
      @PathVariable Integer id, @RequestBody MfFacturaSuplidorFormaPagoRequestDTO dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }
}
