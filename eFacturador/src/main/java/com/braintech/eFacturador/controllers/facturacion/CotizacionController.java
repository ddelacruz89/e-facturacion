package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfCotizacion;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.facturacion.CotizacionServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/facturacion/cotizaciones")
public class CotizacionController {
  private final CotizacionServices cotizacionServices;

  @RequierePermiso(menuUrl = "/facturacion/cotizacion", accion = Accion.ESCRIBIR)
  @PostMapping("cotizacion")
  public ResponseEntity<MfCotizacion> create(@RequestBody MfCotizacion cotizacion) {
    MfCotizacion saved = cotizacionServices.save(cotizacion);
    return ResponseEntity.ok(saved);
  }
}
