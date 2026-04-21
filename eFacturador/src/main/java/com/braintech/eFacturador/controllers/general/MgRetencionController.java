package com.braintech.eFacturador.controllers.general;

import com.braintech.eFacturador.jpa.general.MgRetencion;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.services.general.RetencionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/retencion")
@RequiredArgsConstructor
public class MgRetencionController {
  final RetencionService retencionService;

  @GetMapping
  public ResponseEntity<?> getRetencionesActivas() {
    Response<List<MgRetencion>> retenciones = retencionService.getAllActive();
    return new ResponseEntity<>(retenciones, retenciones.status());
  }

  @PostMapping
  public ResponseEntity<?> createRetencion(@RequestBody MgRetencion entity) {
    Response<MgRetencion> retencion = retencionService.createRetencion(entity);
    return new ResponseEntity<>(retencion, HttpStatus.OK);
  }
}
