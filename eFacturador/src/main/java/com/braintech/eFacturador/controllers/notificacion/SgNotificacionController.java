package com.braintech.eFacturador.controllers.notificacion;

import com.braintech.eFacturador.dto.notificacion.SgNotificacionDTO;
import com.braintech.eFacturador.interfaces.notificacion.SgNotificacionService;
import com.braintech.eFacturador.sse.InAlertaSseService;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
}
