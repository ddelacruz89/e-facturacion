package com.braintech.eFacturador.sse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Gestiona conexiones SSE activas agrupadas por tenant (empresaId + sucursalId).
 *
 * <p>Cuando el scheduler o el listener crea una alerta nueva, llama a {@link #push} para notificar
 * a todos los usuarios conectados de ese tenant sin que ellos tengan que preguntar (polling).
 */
@Slf4j
@Service
public class InAlertaSseService {

  /** 25 minutos — fuerza reconexión antes del timeout típico del proxy/browser (30 min). */
  private static final long EMITTER_TIMEOUT_MS = 25 * 60 * 1000L;

  /** Clave: "empresaId-sucursalId" → lista thread-safe de emitters activos. */
  private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

  /**
   * Registra un nuevo emitter para el tenant dado. El emitter se elimina automáticamente cuando la
   * conexión se cierra, expira o da error.
   */
  public SseEmitter register(Integer empresaId, Integer sucursalId) {
    String key = key(empresaId, sucursalId);
    SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MS);

    emitters.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>()).add(emitter);

    emitter.onCompletion(() -> remove(key, emitter));
    emitter.onTimeout(() -> remove(key, emitter));
    emitter.onError(e -> remove(key, emitter));

    log.debug("SSE registrado: tenant={} total={}", key, emitters.get(key).size());
    return emitter;
  }

  /**
   * Envía un evento "nueva-alerta" a todos los clientes conectados del tenant. Los emitters muertos
   * se eliminan en el mismo pasada.
   */
  public void push(Integer empresaId, Integer sucursalId) {
    String key = key(empresaId, sucursalId);
    List<SseEmitter> list = emitters.get(key);
    if (list == null || list.isEmpty()) return;

    List<SseEmitter> dead = new ArrayList<>();
    for (SseEmitter emitter : list) {
      try {
        emitter.send(SseEmitter.event().name("nueva-alerta").data("{\"nuevaAlerta\":true}"));
      } catch (Exception e) {
        dead.add(emitter);
      }
    }
    if (!dead.isEmpty()) {
      list.removeAll(dead);
      log.debug("SSE limpieza: {} emitters muertos eliminados en tenant={}", dead.size(), key);
    }
  }

  private void remove(String key, SseEmitter emitter) {
    List<SseEmitter> list = emitters.get(key);
    if (list != null) list.remove(emitter);
  }

  private String key(Integer empresaId, Integer sucursalId) {
    return empresaId + "-" + sucursalId;
  }
}
