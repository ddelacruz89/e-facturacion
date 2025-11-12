package com.braintech.eFacturador.controllers.facturacion;

import com.braintech.eFacturador.jpa.general.MgItbis;
import com.braintech.eFacturador.services.facturacion.MgItbisService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mg/itbis")
@RequiredArgsConstructor
public class MgItbisController {

  private final MgItbisService mgItbisService;

  // Get all active records (activo = true)
  @GetMapping
  public List<MgItbis> getAllActive() {
    return mgItbisService.getAllActive();
  }
}
