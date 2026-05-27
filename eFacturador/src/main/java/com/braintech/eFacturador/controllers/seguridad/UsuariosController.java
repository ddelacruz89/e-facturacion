package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.dto.seguridad.AdminResetPasswordResponse;
import com.braintech.eFacturador.dto.seguridad.SgUsuarioResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgUsuarioSearchCriteria;
import com.braintech.eFacturador.interfaces.seguridad.SgUsuarioService;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/seguridad/usuario")
@AllArgsConstructor
public class UsuariosController {

  private final SgUsuarioService usuarioService;

  @PostMapping("/buscar")
  public ResponseEntity<List<SgUsuarioResumenDTO>> buscar(
      @RequestBody SgUsuarioSearchCriteria criteria) {
    return ResponseEntity.ok(usuarioService.buscar(criteria));
  }

  @GetMapping("/{username}")
  public ResponseEntity<SgUsuario> getById(@PathVariable String username) {
    return ResponseEntity.ok(usuarioService.getById(username));
  }

  @PostMapping
  public ResponseEntity<SgUsuario> save(@RequestBody SgUsuario usuario) {
    return ResponseEntity.ok(usuarioService.save(usuario));
  }

  @PutMapping("/{username}")
  public ResponseEntity<SgUsuario> update(
      @PathVariable String username, @RequestBody SgUsuario usuario) {
    return ResponseEntity.ok(usuarioService.update(username, usuario));
  }

  @PostMapping("/{username}/resetear-password")
  public ResponseEntity<AdminResetPasswordResponse> resetearPassword(
      @PathVariable String username) {
    return ResponseEntity.ok(usuarioService.resetearPassword(username));
  }
}
