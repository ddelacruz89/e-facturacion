package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.dto.facturacion.MfFacturaParaDespachoDTO;
import com.braintech.eFacturador.dto.facturacion.PrecioVentaDto;
import com.braintech.eFacturador.facturacionelectronica.models.FacturaValidateResponse;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.ReportServices;
import com.braintech.eFacturador.services.facturacion.FacturacionServices;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("api/v1/facturacion/facturas")
@RestController
@RequiredArgsConstructor
public class FacturaController {
  private final FacturacionServices facturacionServices;
  private final ReportServices reportServices;

  @GetMapping("reporte/{id}")
  public ResponseEntity<?> getReporteFactura(@PathVariable Integer id) {

    final byte[] file = reportServices.getFacturaById(id);
    final HttpHeaders headers = new HttpHeaders();
    headers.add("Content-Disposition", "attachment; filename=" + "facturas.pdf");
    return ResponseEntity.ok()
        .headers(headers)
        .contentLength(file.length)
        .contentType(MediaType.parseMediaType("application/pdf"))
        .body(file);
  }

  // Get all active records (estadoId = 'ACT')
  @GetMapping
  public List<MfFactura> getAll() {
    return facturacionServices.getAllActive();
  }

  // Get all records including inactive
  @GetMapping("{page}/{size}")
  public ResponseEntity<?> getAllIncludingInactive(
      @PathVariable Integer page, @PathVariable Integer size) {
    return ResponseEntity.ok(facturacionServices.getAll(page, size));
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

  @GetMapping("/sender/{id}")
  public ResponseEntity<FacturaValidateResponse> getSender(@PathVariable Integer id) {
    FacturaValidateResponse facturaValidateResponse = facturacionServices.senderFacturaEcf(id);
    return ResponseEntity.ok(facturaValidateResponse);
  }

  @RequierePermiso(menuUrl = "/facturacion", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<MfFactura> create(@RequestBody MfFactura factura) {
    MfFactura saved = facturacionServices.create(factura);
    return ResponseEntity.ok(saved);
  }

  @RequierePermiso(menuUrl = "/facturacion", accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<MfFactura> update(
      @PathVariable Integer id, @RequestBody MfFactura factura) {
    MfFactura updated = facturacionServices.update(id, factura);
    return ResponseEntity.ok(updated);
  }

  // Soft delete - changes estadoId to 'INA'
  @RequierePermiso(menuUrl = "/facturacion", accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    facturacionServices.disable(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/productos/ventas")
  public ResponseEntity<List<PrecioVentaDto>> getProductosVentas() {
    List<PrecioVentaDto> productoVenta = facturacionServices.getProductoVenta();
    return ResponseEntity.ok(productoVenta);
  }

  @GetMapping("/para-despacho")
  public ResponseEntity<List<MfFacturaParaDespachoDTO>> getFacturasParaDespacho(
      @RequestParam(required = false) Integer rutaId) {
    return ResponseEntity.ok(facturacionServices.getFacturasParaDespacho(rutaId));
  }
}
