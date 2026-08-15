package com.braintech.eFacturador.controllers.contabilidad;

import com.braintech.eFacturador.dto.contabilidad.McCuentaNodoDTO;
import com.braintech.eFacturador.dto.contabilidad.McCuentaRequestDTO;
import com.braintech.eFacturador.interfaces.contabilidad.McCuentaService;
import com.braintech.eFacturador.jpa.contabilidad.McCuenta;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/contabilidad/cuentas")
@RequiredArgsConstructor
public class McCuentaController {

  private static final String MENU_URL = "/contabilidad/cuentas";

  private final McCuentaService cuentaService;

  /** Nivel 1: cuentas raíz (sin padre), paginadas. GET /api/v1/contabilidad/cuentas/raices */
  @GetMapping("/raices")
  public ResponseEntity<Page<McCuentaNodoDTO>> raices(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(cuentaService.buscarRaices(page, size));
  }

  /**
   * Hijos directos de una cuenta. Se llama al expandir una fila en el frontend.
   *
   * <p>GET /api/v1/contabilidad/cuentas/{padreId}/hijos
   */
  @GetMapping("/{padreId}/hijos")
  public ResponseEntity<List<McCuentaNodoDTO>> hijos(@PathVariable Integer padreId) {
    return ResponseEntity.ok(cuentaService.buscarHijos(padreId));
  }

  /** GET /{id} — objeto completo para editar. */
  @GetMapping("/{id}")
  public ResponseEntity<McCuenta> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(cuentaService.getById(id));
  }

  @RequierePermiso(menuUrl = MENU_URL, accion = Accion.ESCRIBIR)
  @PostMapping
  public ResponseEntity<McCuenta> create(@RequestBody McCuentaRequestDTO request) {
    return ResponseEntity.ok(cuentaService.create(request));
  }

  @RequierePermiso(menuUrl = MENU_URL, accion = Accion.ESCRIBIR)
  @PutMapping("/{id}")
  public ResponseEntity<McCuenta> update(
      @PathVariable Integer id, @RequestBody McCuentaRequestDTO request) {
    return ResponseEntity.ok(cuentaService.update(id, request));
  }

  /** DELETE /{id} — Desactivar (soft delete → estadoId = 'INA'). */
  @RequierePermiso(menuUrl = MENU_URL, accion = Accion.ELIMINAR)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> disable(@PathVariable Integer id) {
    cuentaService.disable(id);
    return ResponseEntity.noContent().build();
  }

  /** PATCH /{id}/activar — Reactivar cuenta (estadoId = 'ACT'). */
  @RequierePermiso(menuUrl = MENU_URL, accion = Accion.ESCRIBIR)
  @PatchMapping("/{id}/activar")
  public ResponseEntity<Void> enable(@PathVariable Integer id) {
    cuentaService.enable(id);
    return ResponseEntity.noContent().build();
  }
}
