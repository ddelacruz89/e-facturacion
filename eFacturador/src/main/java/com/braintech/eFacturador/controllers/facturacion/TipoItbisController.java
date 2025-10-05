package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgItbis;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.services.facturacion.TipoItbisServices;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("api/itbis/tipo")
@RestController
@RequiredArgsConstructor
public class TipoItbisController {
  private final TipoItbisServices tipoItbisServices;

  @GetMapping("all")
  public ResponseEntity<Response<List<MgItbis>>> findAll() {
    Response<List<MgItbis>> response = tipoItbisServices.findAll();
    return ResponseEntity.status(response.status()).body(response);
  }

  @PostMapping
  public ResponseEntity<Response<MgItbis>> save(@RequestBody MgItbis tipoItbis) {
    Response<MgItbis> response = tipoItbisServices.save(tipoItbis);
    return ResponseEntity.status(response.status()).body(response);
  }
}
