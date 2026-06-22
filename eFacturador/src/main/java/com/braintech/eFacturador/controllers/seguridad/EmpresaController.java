package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgEmpresa;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import com.braintech.eFacturador.services.seguridad.EmpresaServices;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/seguridad/empresa")
@AllArgsConstructor
public class EmpresaController {
  private EmpresaServices services;

  @GetMapping
  public ResponseEntity<Response<?>> getEmpresa() {
    Response<?> response = services.getCurrent();
    return ResponseEntity.ok(response);
  }

  @PostMapping
  @RequierePermiso(menuUrl = "/empresa", accion = Accion.ESCRIBIR)
  public ResponseEntity<Response<?>> addEmpresa(@RequestBody SgEmpresa empresa) {
    final String username = "Master";
    empresa.setFechaReg(LocalDateTime.now());
    empresa.setUsuarioReg(username);
    Response<SgEmpresa> rEmpresa = services.save(empresa);
    if (rEmpresa.status() == HttpStatus.OK) {
      return ResponseEntity.ok(rEmpresa);
    } else {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(rEmpresa);
    }
  }
}
