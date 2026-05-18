package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderResumenDTO;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorPagosHeaderSearchCriteria;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorFormaPago;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorPagosHeader;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.facturacion.MfFacturaSuplidorPagosService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/facturacion/pagos-suplidor")
@AllArgsConstructor
public class MfFacturaSuplidorPagosController {

  private final MfFacturaSuplidorPagosService service;

  /** Búsqueda con filtros — devuelve resumen para la tabla del modal. */
  @PostMapping("/buscar")
  public ResponseEntity<List<MfFacturaSuplidorPagosHeaderResumenDTO>> buscar(
      @RequestBody MfFacturaSuplidorPagosHeaderSearchCriteria criteria) {
    return ResponseEntity.ok(service.buscar(criteria));
  }

  /** Objeto completo con detalles — se llama al hacer click en el modal. */
  @GetMapping("/{id}")
  public ResponseEntity<MfFacturaSuplidorPagosHeader> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(service.findById(id));
  }

  /** Catálogo de formas de pago activas. */
  @GetMapping("/formas-pago")
  public ResponseEntity<List<MfFacturaSuplidorFormaPago>> getFormasPago() {
    return ResponseEntity.ok(service.findFormasPago());
  }

  /** Registrar nuevo pago. */
  @RequierePermiso(menuUrl = "/pagos-suplidor", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<MfFacturaSuplidorPagosHeader> save(
      @RequestBody MfFacturaSuplidorPagosHeaderRequestDTO dto) {
    return ResponseEntity.ok(service.save(dto));
  }

  /** Actualizar pago existente. */
  @RequierePermiso(menuUrl = "/pagos-suplidor", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<MfFacturaSuplidorPagosHeader> update(
      @PathVariable Integer id, @RequestBody MfFacturaSuplidorPagosHeaderRequestDTO dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  /** Anular pago — marca estado ANU y registra fecha/usuario de anulación. */
  @RequierePermiso(menuUrl = "/pagos-suplidor", accion = Accion.ESCRIBIR)
  @PatchMapping("/{id}/anular")
  public ResponseEntity<MfFacturaSuplidorPagosHeader> anular(@PathVariable Integer id) {
    return ResponseEntity.ok(service.anular(id));
  }
}
