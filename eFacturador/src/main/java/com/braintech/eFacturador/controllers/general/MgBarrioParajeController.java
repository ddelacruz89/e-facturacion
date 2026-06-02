package com.braintech.eFacturador.controllers.general;

import com.braintech.eFacturador.dto.general.MgBarrioParajeResumenDTO;
import com.braintech.eFacturador.dto.general.MgSubBarrioResumenDTO;
import com.braintech.eFacturador.interfaces.general.BarrioParajeService;
import com.braintech.eFacturador.jpa.general.MgBarrioParaje;
import com.braintech.eFacturador.models.Response;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/general/barrios")
@RequiredArgsConstructor
public class MgBarrioParajeController {

  private final BarrioParajeService barrioService;

  @GetMapping("/{id}")
  public ResponseEntity<?> getById(@PathVariable Integer id) {
    Response<MgBarrioParaje> r = barrioService.getById(id);
    return new ResponseEntity<>(r, r.status());
  }

  @GetMapping("/por-municipio/{municipioId}")
  public ResponseEntity<?> getByMunicipio(@PathVariable Integer municipioId) {
    Response<List<MgBarrioParajeResumenDTO>> r = barrioService.getByMunicipio(municipioId);
    return new ResponseEntity<>(r, r.status());
  }

  @GetMapping("/{barrioId}/sub-barrios")
  public ResponseEntity<?> getSubBarrios(@PathVariable Integer barrioId) {
    Response<List<MgSubBarrioResumenDTO>> r = barrioService.getSubBarriosByBarrio(barrioId);
    return new ResponseEntity<>(r, r.status());
  }
}
