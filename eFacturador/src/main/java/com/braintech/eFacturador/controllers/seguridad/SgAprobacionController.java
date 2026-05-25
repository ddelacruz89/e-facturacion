package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.dto.seguridad.SgAprobacionResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgAprobacionSearchCriteria;
import com.braintech.eFacturador.dto.seguridad.SgConfigAprobacionResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgConfigAprobacionSearchCriteria;
import com.braintech.eFacturador.interfaces.seguridad.SgAprobacionService;
import com.braintech.eFacturador.jpa.seguridad.SgAprobacion;
import com.braintech.eFacturador.jpa.seguridad.SgConfigAprobacion;
import com.braintech.eFacturador.security.Accion;
import com.braintech.eFacturador.security.RequierePermiso;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seguridad/aprobaciones")
@AllArgsConstructor
public class SgAprobacionController {

  private final SgAprobacionService aprobacionService;

  // ── Configuración de aprobación ───────────────────────────────────────────

  @PostMapping("/config/buscar")
  public ResponseEntity<List<SgConfigAprobacionResumenDTO>> buscarConfig(
      @RequestBody SgConfigAprobacionSearchCriteria criteria) {
    return ResponseEntity.ok(aprobacionService.buscarConfig(criteria));
  }

  @GetMapping("/config/{id}")
  public ResponseEntity<SgConfigAprobacion> getConfigById(@PathVariable Integer id) {
    return ResponseEntity.ok(aprobacionService.getConfigById(id));
  }

  @PostMapping("/config")
  @RequierePermiso(menuUrl = "/aprobaciones-config", accion = Accion.ESCRIBIR)
  public ResponseEntity<SgConfigAprobacion> saveConfig(@RequestBody SgConfigAprobacion config) {
    return ResponseEntity.ok(aprobacionService.saveConfig(config));
  }

  @PutMapping("/config/{id}")
  @RequierePermiso(menuUrl = "/aprobaciones-config", accion = Accion.ESCRIBIR)
  public ResponseEntity<SgConfigAprobacion> updateConfig(
      @PathVariable Integer id, @RequestBody SgConfigAprobacion config) {
    return ResponseEntity.ok(aprobacionService.updateConfig(id, config));
  }

  @DeleteMapping("/config/{id}")
  @RequierePermiso(menuUrl = "/aprobaciones-config", accion = Accion.ELIMINAR)
  public ResponseEntity<Void> desactivarConfig(@PathVariable Integer id) {
    aprobacionService.desactivarConfig(id);
    return ResponseEntity.noContent().build();
  }

  // ── Solicitudes de aprobación ─────────────────────────────────────────────

  /** Bandeja del aprobador: solicitudes pendientes asignadas al usuario actual. */
  @GetMapping("/pendientes")
  public ResponseEntity<List<SgAprobacionResumenDTO>> getMisPendientes() {
    return ResponseEntity.ok(aprobacionService.getMisPendientes());
  }

  @GetMapping("/{id}")
  public ResponseEntity<SgAprobacion> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(aprobacionService.getById(id));
  }

  @PostMapping("/buscar")
  public ResponseEntity<List<SgAprobacionResumenDTO>> buscar(
      @RequestBody SgAprobacionSearchCriteria criteria) {
    return ResponseEntity.ok(aprobacionService.buscar(criteria));
  }

  /** Aprobar una solicitud. Body JSON: { "comentario": "..." } */
  @PostMapping("/{id}/aprobar")
  @RequierePermiso(menuUrl = "/aprobaciones-bandeja", accion = Accion.ESCRIBIR)
  public ResponseEntity<SgAprobacion> aprobar(
      @PathVariable Integer id, @RequestBody(required = false) Map<String, String> body) {
    String comentario = body != null ? body.getOrDefault("comentario", "") : "";
    return ResponseEntity.ok(aprobacionService.responder(id, "APR", comentario));
  }

  /** Rechazar una solicitud. Body JSON: { "comentario": "..." } */
  @PostMapping("/{id}/rechazar")
  @RequierePermiso(menuUrl = "/aprobaciones-bandeja", accion = Accion.ESCRIBIR)
  public ResponseEntity<SgAprobacion> rechazar(
      @PathVariable Integer id, @RequestBody(required = false) Map<String, String> body) {
    String comentario = body != null ? body.getOrDefault("comentario", "") : "";
    return ResponseEntity.ok(aprobacionService.responder(id, "REC", comentario));
  }
}
