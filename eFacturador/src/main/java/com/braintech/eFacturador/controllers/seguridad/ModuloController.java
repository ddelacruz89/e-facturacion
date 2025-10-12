package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.jpa.seguridad.dto.ModuloDto;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.services.seguridad.ModuloServices;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/seguridad/modulo")
public class ModuloController {
  private final ModuloServices moduloServices;

  @GetMapping("permitidos")
  public ResponseEntity<?> permitido() {
    Response<List<ModuloDto>> entity = moduloServices.getFindByAll();
    return new ResponseEntity<>(entity, entity.status());
  }
}
