package com.braintech.eFacturador.controllers.general;

import com.braintech.eFacturador.dto.general.MgMunicipioResumenDTO;
import com.braintech.eFacturador.dto.general.MgMunicipioSearchCriteria;
import com.braintech.eFacturador.interfaces.general.MunicipioService;
import com.braintech.eFacturador.jpa.general.MgMunicipio;
import com.braintech.eFacturador.models.Response;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/general/municipios")
@RequiredArgsConstructor
public class MgMunicipioController {

  private final MunicipioService municipioService;

  @GetMapping("/{id}")
  public ResponseEntity<?> getById(@PathVariable Integer id) {
    Response<MgMunicipio> r = municipioService.getById(id);
    return new ResponseEntity<>(r, r.status());
  }

  @GetMapping("/por-provincia/{codProvincia}")
  public ResponseEntity<?> getByProvincia(@PathVariable String codProvincia) {
    Response<List<MgMunicipioResumenDTO>> r = municipioService.getByProvincia(codProvincia);
    return new ResponseEntity<>(r, r.status());
  }

  @PostMapping("/buscar")
  public ResponseEntity<?> buscar(@RequestBody MgMunicipioSearchCriteria criteria) {
    Response<Page<MgMunicipioResumenDTO>> r = municipioService.buscar(criteria);
    return new ResponseEntity<>(r, r.status());
  }
}
