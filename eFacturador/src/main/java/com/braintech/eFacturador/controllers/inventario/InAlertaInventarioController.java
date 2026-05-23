package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InAlertaDTO;
import com.braintech.eFacturador.interfaces.inventario.InAlertaInventarioService;
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
@RequestMapping("api/v1/inventario/alertas")
public class InAlertaInventarioController {

  @Autowired private InAlertaInventarioService alertaService;
  @Autowired private InAlertaSseService sseService;
  @Autowired private TenantContext tenantContext;

  /** GET / — Alertas activas del tenant con flag visto por usuario autenticado. */
  @GetMapping
  public List<InAlertaDTO> getActivas() {
    return alertaService.findActivas();
  }

  /** GET /contador — Cantidad de alertas activas no vistas por el usuario autenticado. */
  @GetMapping("/contador")
  public ResponseEntity<Map<String, Long>> getContador() {
    return ResponseEntity.ok(Map.of("noVistas", alertaService.contarNoVistas()));
  }

  /**
   * GET /stream — Abre una conexión SSE. El servidor empuja un evento cada vez que se genera una
   * alerta nueva para el tenant del usuario autenticado.
   *
   * <p>El token JWT se pasa como query param {@code ?token=} porque {@code EventSource} del browser
   * no soporta headers personalizados.
   */
  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter stream() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return sseService.register(empresaId, sucursalId);
  }

  /** POST /{id}/visto — Marca la alerta como vista. Idempotente. */
  @PostMapping("/{id}/visto")
  public ResponseEntity<Void> marcarVisto(@PathVariable Integer id) {
    alertaService.marcarVisto(id);
    return ResponseEntity.noContent().build();
  }

  /** PUT /{id}/cerrar — Cierra la alerta (estadoId = 'CER'). */
  @PutMapping("/{id}/cerrar")
  public ResponseEntity<Void> cerrar(@PathVariable Integer id) {
    alertaService.cerrar(id);
    return ResponseEntity.noContent().build();
  }
}
