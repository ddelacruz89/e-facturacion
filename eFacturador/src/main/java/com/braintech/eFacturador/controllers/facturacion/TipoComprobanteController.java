package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgTipoComprobante;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.facturacion.TipoComprobanteServices;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("api/facturacion/tipo/comprobante")
@RestController
@RequiredArgsConstructor
public class TipoComprobanteController {
  private final TipoComprobanteServices tipoComprobanteServices;

  @GetMapping("all")
  public ResponseEntity<Response<List<MgTipoComprobante>>> findAll(
      @RequestParam(required = false) String categoria) {
    Response<List<MgTipoComprobante>> response =
        (categoria != null && !categoria.isBlank())
            ? tipoComprobanteServices.findByCategoria(categoria)
            : tipoComprobanteServices.findAll();
    return ResponseEntity.status(response.status()).body(response);
  }

  @RequierePermiso(menuUrl = "/tipo/comprobante", accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<Response<MgTipoComprobante>> save(
      @RequestBody MgTipoComprobante tipoComprobante) {
    Response<MgTipoComprobante> response = tipoComprobanteServices.save(tipoComprobante);
    return ResponseEntity.status(response.status()).body(response);
  }
}
