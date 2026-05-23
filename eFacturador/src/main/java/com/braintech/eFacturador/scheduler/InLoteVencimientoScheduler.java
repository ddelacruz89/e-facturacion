package com.braintech.eFacturador.scheduler;

import com.braintech.eFacturador.dao.notificacion.SgNotificacionRepository;
import com.braintech.eFacturador.jpa.notificacion.SgNotificacion;
import com.braintech.eFacturador.sse.InAlertaSseService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Job diario que recorre TODOS los tenants buscando lotes próximos a vencer y genera notificaciones
 * de tipo VENCIMIENTO en {@code sg_notificacion}.
 *
 * <p>Criterio de activación (cualquiera):
 *
 * <ul>
 *   <li>{@code fecha_alerta_vencimiento} ≤ hoy
 *   <li>{@code fecha_vencimiento - alertas_dias} ≤ hoy
 *   <li>{@code fecha_vencimiento} ≤ hoy (ya vencido)
 * </ul>
 *
 * <p>Usa {@code referenciaKey = "lote:productoId"} para evitar duplicados.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InLoteVencimientoScheduler {

  private static final String MODULO = "INVENTARIO";
  private static final String TIPO = "VENCIMIENTO";
  private static final String ESTADO_ACT = "ACT";
  private static final String USUARIO_SISTEMA = "SISTEMA";

  @PersistenceContext private EntityManager entityManager;

  private final SgNotificacionRepository notificacionRepository;
  private final InAlertaSseService sseService;

  @Scheduled(cron = "0 0 6 * * *")
  @Transactional
  public void verificarVencimientos() {
    log.info(">> InLoteVencimientoScheduler: iniciando verificación");

    List<Object[]> lotes = buscarLotesPorVencer();
    int creadas = 0;
    int yaExistentes = 0;

    for (Object[] row : lotes) {
      String lote = (String) row[0];
      Integer productoId = (Integer) row[1];
      Integer empresaId = (Integer) row[2];
      Integer sucursalId = (Integer) row[3];
      LocalDate fechaVenc = row[4] != null ? ((java.sql.Date) row[4]).toLocalDate() : null;

      String referenciaKey = lote + ":" + productoId;

      if (notificacionRepository.existsByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId(
          MODULO, TIPO, referenciaKey, empresaId, ESTADO_ACT)) {
        yaExistentes++;
        continue;
      }

      crearNotificacion(lote, productoId, empresaId, sucursalId, fechaVenc, referenciaKey);
      sseService.push(empresaId, sucursalId);
      creadas++;
    }

    log.info("<< InLoteVencimientoScheduler: {} creadas, {} ya existían", creadas, yaExistentes);
  }

  @SuppressWarnings("unchecked")
  private List<Object[]> buscarLotesPorVencer() {
    return entityManager
        .createNativeQuery(
            """
            SELECT l.lote, l.producto_id, l.empresa_id, l.sucursal_id, l.fecha_vencimiento
            FROM inventario.in_lote l
            WHERE l.estado_id = 'ACT'
              AND l.fecha_vencimiento IS NOT NULL
              AND (
                  (l.fecha_alerta_vencimiento IS NOT NULL
                   AND l.fecha_alerta_vencimiento <= CURRENT_DATE)
                  OR
                  (l.alertas_dias IS NOT NULL
                   AND l.fecha_vencimiento - (l.alertas_dias || ' days')::interval <= NOW())
                  OR l.fecha_vencimiento <= NOW()
              )
              AND NOT EXISTS (
                  SELECT 1 FROM general.sg_notificacion n
                  WHERE n.modulo        = 'INVENTARIO'
                    AND n.tipo          = 'VENCIMIENTO'
                    AND n.referencia_key = l.lote || ':' || l.producto_id
                    AND n.empresa_id    = l.empresa_id
                    AND n.estado_id     = 'ACT'
              )
            """)
        .getResultList();
  }

  private void crearNotificacion(
      String lote,
      Integer productoId,
      Integer empresaId,
      Integer sucursalId,
      LocalDate fechaVencimiento,
      String referenciaKey) {

    SgNotificacion notif = new SgNotificacion();
    notif.setEmpresaId(empresaId);
    notif.setSucursalId(sucursalId);
    notif.setModulo(MODULO);
    notif.setTipo(TIPO);
    notif.setTitulo("Lote " + lote + " próximo a vencer");
    notif.setDescripcion(
        "El lote "
            + lote
            + " del producto #"
            + productoId
            + (fechaVencimiento != null ? " vence el " + fechaVencimiento : " ya venció"));
    notif.setReferenciaId(productoId);
    notif.setReferenciaTipo("InLote");
    notif.setReferenciaKey(referenciaKey);
    notif.setPayload(
        Map.of(
            "lote", lote,
            "productoId", productoId,
            "fechaVencimiento", fechaVencimiento != null ? fechaVencimiento.toString() : ""));
    notif.setEstadoId(ESTADO_ACT);
    notif.setFechaReg(LocalDateTime.now());
    notif.setUsuarioReg(USUARIO_SISTEMA);
    notificacionRepository.save(notif);

    log.info(
        "Notificación VENCIMIENTO creada: lote={} productoId={} empresa={}",
        lote,
        productoId,
        empresaId);
  }
}
