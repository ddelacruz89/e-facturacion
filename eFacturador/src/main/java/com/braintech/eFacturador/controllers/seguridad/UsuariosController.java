package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.services.seguridad.UsuarioServices;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/seguridad/usuario")
@AllArgsConstructor
public class UsuariosController {
  UsuarioServices usuarioServices;

  @GetMapping
  public ResponseEntity<?> getUsuario() {
    Response<?> response = usuarioServices.getFindByAll();
    if (response.status() == HttpStatus.OK) {
      return ResponseEntity.ok(response);
    } else {
      return ResponseEntity.status(response.status()).body(response);
    }
  }

  @PostMapping
  public ResponseEntity<?> saveUsuario(@RequestBody SgUsuario entity) {
    Response<?> response = usuarioServices.save(entity);
    if (response.status() == HttpStatus.OK) {
      return ResponseEntity.ok(response);
    } else {
      return ResponseEntity.status(response.status()).body(response);
    }
  }
}
