package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorSearchCriteria;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.facturacion.MfFacturaSuplidorService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/facturacion/facturas-suplidor")
@AllArgsConstructor
public class MfFacturaSuplidorController {

  private final MfFacturaSuplidorService service;

  /**
   * Búsqueda con filtros — devuelve resumen para la tabla del modal. POST
   * /api/v1/facturacion/facturas-suplidor/buscar
   */
  @PostMapping("/buscar")
  public ResponseEntity<List<MfFacturaSuplidorResumenDTO>> buscar(
      @RequestBody MfFacturaSuplidorSearchCriteria criteria) {
    return ResponseEntity.ok(service.buscar(criteria));
  }

  /**
   * Objeto completo con detalles — se llama al hacer click en el modal. GET
   * /api/v1/facturacion/facturas-suplidor/{id}
   */
  @GetMapping("/{id}")
  public ResponseEntity<MfFacturaSuplidor> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(service.findById(id));
  }

  @GetMapping("/by-secuencia/{secuencia}")
  public ResponseEntity<MfFacturaSuplidor> getBySecuencia(@PathVariable Integer secuencia) {
    return ResponseEntity.ok(service.findBySecuencia(secuencia));
  }

  /** Crear nueva factura suplidor. POST /api/v1/facturacion/facturas-suplidor */
  @RequierePermiso(menuUrl = "/factura-suplidor", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<MfFacturaSuplidor> save(@RequestBody MfFacturaSuplidorRequestDTO dto) {
    return ResponseEntity.ok(service.save(dto));
  }

  /** Actualizar factura suplidor existente. PUT /api/v1/facturacion/facturas-suplidor/{id} */
  @RequierePermiso(menuUrl = "/factura-suplidor", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<MfFacturaSuplidor> update(
      @PathVariable Integer id, @RequestBody MfFacturaSuplidorRequestDTO dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }
}
