package com.braintech.eFacturador.controllers.general;

import com.braintech.eFacturador.interfaces.general.ProvinciaService;
import com.braintech.eFacturador.jpa.general.MgProvincia;
import com.braintech.eFacturador.models.Response;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/general/provincias")
@RequiredArgsConstructor
public class MgProvinciaController {

  private final ProvinciaService provinciaService;

  @GetMapping
  public ResponseEntity<?> getAll() {
    Response<List<MgProvincia>> response = provinciaService.getAll();
    return new ResponseEntity<>(response, response.status());
  }
}
