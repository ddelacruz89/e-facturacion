package com.braintech.eFacturador.controllers.notificacion;

import com.braintech.eFacturador.dto.notificacion.SgNotificacionDTO;
import com.braintech.eFacturador.dto.notificacion.SgNotificacionTipoConfigDTO;
import com.braintech.eFacturador.dto.notificacion.SgNotificacionTipoConfigPatchDTO;
import com.braintech.eFacturador.interfaces.notificacion.SgNotificacionService;
import com.braintech.eFacturador.sse.InAlertaSseService;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("api/v1/notificaciones")
public class SgNotificacionController {

  @Autowired private SgNotificacionService notificacionService;
  @Autowired private InAlertaSseService sseService;
  @Autowired private TenantContext tenantContext;

  /** GET / — Todas las notificaciones activas del tenant con flag visto por usuario. */
  @GetMapping
  public List<SgNotificacionDTO> getActivas() {
    return notificacionService.findActivas();
  }

  /** GET /modulo/{modulo} — Filtradas por módulo (INVENTARIO, COMPRAS, APROBACIONES…). */
  @GetMapping("/modulo/{modulo}")
  public List<SgNotificacionDTO> getActivasByModulo(@PathVariable String modulo) {
    return notificacionService.findActivasByModulo(modulo);
  }

  /** GET /contador — Cantidad no vista por el usuario autenticado. */
  @GetMapping("/contador")
  public ResponseEntity<Map<String, Long>> getContador() {
    return ResponseEntity.ok(Map.of("noVistas", notificacionService.contarNoVistas()));
  }

  /**
   * GET /stream — Conexión SSE. El servidor empuja "nueva-notificacion" cuando se genera una
   * notificación para el tenant. Token JWT via query param {@code ?token=}.
   */
  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter stream() {
    return sseService.register(
        tenantContext.getCurrentEmpresaId(), tenantContext.getCurrentSucursalId());
  }

  /** POST /{id}/visto — Marca como vista. Idempotente. */
  @PostMapping("/{id}/visto")
  public ResponseEntity<Void> marcarVisto(@PathVariable Integer id) {
    notificacionService.marcarVisto(id);
    return ResponseEntity.noContent().build();
  }

  /** PUT /{id}/cerrar — Cierra la notificación (estadoId = 'CER'). */
  @PutMapping("/{id}/cerrar")
  public ResponseEntity<Void> cerrar(@PathVariable Integer id) {
    notificacionService.cerrar(id);
    return ResponseEntity.noContent().build();
  }

  /**
   * GET /login — Notificaciones pendientes de leer al iniciar sesión (para_login=true, no vistas,
   * suscritas).
   */
  @GetMapping("/login")
  public ResponseEntity<List<SgNotificacionDTO>> getLoginPendientes() {
    return ResponseEntity.ok(notificacionService.findLoginPendientes());
  }

  /** GET /tipos — Catálogo de tipos activos (sin flag suscrito). */
  @GetMapping("/tipos")
  public ResponseEntity<List<SgNotificacionTipoConfigDTO>> getTodosTipos() {
    return ResponseEntity.ok(notificacionService.getTiposConSuscripcion("__NONE__"));
  }

  /** GET /tipos/{username} — Catálogo de tipos activos con flag suscrito para el usuario dado. */
  @GetMapping("/tipos/{username}")
  public ResponseEntity<List<SgNotificacionTipoConfigDTO>> getTipos(@PathVariable String username) {
    return ResponseEntity.ok(notificacionService.getTiposConSuscripcion(username));
  }

  /** PUT /tipos/{username}/suscripciones — Guarda los tipos suscritos del usuario (reemplaza). */
  @PutMapping("/tipos/{username}/suscripciones")
  public ResponseEntity<Void> saveSuscripciones(
      @PathVariable String username, @RequestBody java.util.Set<String> tipoIds) {
    notificacionService.saveSuscripciones(username, tipoIds);
    return ResponseEntity.noContent().build();
  }

  /** PATCH /tipos/{tipoId} — Actualiza paraLogin y/o activo de un tipo (admin). */
  @PatchMapping("/tipos/{tipoId}")
  public ResponseEntity<Void> patchTipo(
      @PathVariable String tipoId, @RequestBody SgNotificacionTipoConfigPatchDTO patch) {
    notificacionService.patchTipoConfig(tipoId, patch);
    return ResponseEntity.noContent().build();
  }

  /**
   * POST / — Crea una notificación desde la app de management.
   * Body: { modulo, tipo, titulo, descripcion, repetirLogin, fechaExpiracion, destinatarios[] }
   * Si destinatarios es null o vacío → aplica regla de acceso_restringido del tipo.
   */
  @PostMapping
  public ResponseEntity<SgNotificacionDTO> crear(@RequestBody SgNotificacionDTO dto) {
    SgNotificacionDTO created = notificacionService.crear(dto);
    return ResponseEntity.status(201).body(created);
  }

  /** GET /{id}/destinatarios — Lista los usernames destinatarios específicos de la notificación. */
  @GetMapping("/{id}/destinatarios")
  public ResponseEntity<List<String>> getDestinatarios(@PathVariable Integer id) {
    return ResponseEntity.ok(notificacionService.getDestinatarios(id));
  }

  /** POST /{id}/destinatarios — Agrega un destinatario. Body: { "username": "..." } */
  @PostMapping("/{id}/destinatarios")
  public ResponseEntity<Void> addDestinatario(
      @PathVariable Integer id, @RequestBody Map<String, String> body) {
    notificacionService.addDestinatario(id, body.get("username"));
    return ResponseEntity.noContent().build();
  }

  /** DELETE /{id}/destinatarios/{username} — Elimina un destinatario específico. */
  @DeleteMapping("/{id}/destinatarios/{username}")
  public ResponseEntity<Void> removeDestinatario(
      @PathVariable Integer id, @PathVariable String username) {
    notificacionService.removeDestinatario(id, username);
    return ResponseEntity.noContent().build();
  }
}
