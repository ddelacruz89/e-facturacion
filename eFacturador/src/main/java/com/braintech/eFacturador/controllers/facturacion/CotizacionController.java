package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfCotizacion;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.ReportServices;
import com.braintech.eFacturador.services.facturacion.CotizacionServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/facturacion/cotizaciones")
public class CotizacionController {
  private final CotizacionServices cotizacionServices;
  private final ReportServices reportServices;

  @RequierePermiso(menuUrl = "/facturacion/cotizacion", accion = Accion.ESCRIBIR)
  @PostMapping("cotizacion")
  public ResponseEntity<MfCotizacion> create(@RequestBody MfCotizacion cotizacion) {
    MfCotizacion saved = cotizacionServices.save(cotizacion);
    return ResponseEntity.ok(saved);
  }

  @RequierePermiso(menuUrl = "/facturacion/cotizacion", accion = Accion.ESCRIBIR)
  @GetMapping("numero/{secuencia}")
  public ResponseEntity<MfCotizacion> getByNumeroCotizacion(
      @PathVariable("secuencia") Integer secuencia) {
    MfCotizacion cotizacion = cotizacionServices.getByNumeroCotizacion(secuencia);
    return ResponseEntity.ok(cotizacion);
  }

  @GetMapping("reporte/{id}")
  public ResponseEntity<?> getReporteFactura(@PathVariable Integer id) {

    final byte[] file = reportServices.getCotizacion(id);
    final HttpHeaders headers = new HttpHeaders();
    headers.add("Content-Disposition", "attachment; filename=" + "facturas.pdf");
    return ResponseEntity.ok()
        .headers(headers)
        .contentLength(file.length)
        .contentType(MediaType.parseMediaType("application/pdf"))
        .body(file);
  }

  @GetMapping("{page}/{size}")
  public ResponseEntity<?> getAllIncludingInactive(
      @PathVariable Integer page, @PathVariable Integer size) {
    return ResponseEntity.ok(cotizacionServices.getAll(page, size));
  }
}
