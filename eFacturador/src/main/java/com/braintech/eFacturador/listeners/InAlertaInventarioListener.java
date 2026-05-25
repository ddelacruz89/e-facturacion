package com.braintech.eFacturador.listeners;

import com.braintech.eFacturador.dao.inventario.InAlertaLimiteRepository;
import com.braintech.eFacturador.dao.notificacion.SgNotificacionRepository;
import com.braintech.eFacturador.events.InStockBajoEvent;
import com.braintech.eFacturador.jpa.notificacion.SgNotificacion;
import com.braintech.eFacturador.sse.InAlertaSseService;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Procesa alertas de stock bajo de forma asíncrona al recibir un {@link InStockBajoEvent}.
 *
 * <p>Flujo:
 *
 * <ol>
 *   <li>Lee el límite mínimo configurado para ese producto/almacén/empresa.
 *   <li>Si no hay límite → no hace nada.
 *   <li>Si {@code cantidadActual < limite} → crea notificación STOCK_BAJO (si no existe ya).
 *   <li>Si {@code cantidadActual >= limite} → cierra la notificación activa (si existe).
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InAlertaInventarioListener {

  private static final String MODULO = "INVENTARIO";
  private static final String TIPO = "STOCK_BAJO";
  private static final String ESTADO_ACT = "ACT";
  private static final String ESTADO_CER = "CER";
  private static final String USUARIO_SISTEMA = "SISTEMA";
  private static final String MENU_URL = "/almacenes";

  private final SgNotificacionRepository notificacionRepository;
  private final InAlertaLimiteRepository limiteRepository;
  private final InAlertaSseService sseService;

  @Async("alertasExecutor")
  @EventListener
  @Transactional
  public void onStockMovimiento(InStockBajoEvent event) {
    try {
      procesarAlertaStock(
          event.getProductoId(),
          event.getAlmacenId(),
          event.getEmpresaId(),
          event.getSucursalId(),
          event.getCantidadActual());
    } catch (Exception ex) {
      log.error(
          "Error procesando alerta de stock para productoId={} almacenId={} empresaId={}: {}",
          event.getProductoId(),
          event.getAlmacenId(),
          event.getEmpresaId(),
          ex.getMessage());
    }
  }

  private void procesarAlertaStock(
      Integer productoId,
      Integer almacenId,
      Integer empresaId,
      Integer sucursalId,
      Integer cantidadActual) {

    Optional<Integer> limiteOpt = limiteRepository.findLimite(productoId, almacenId, empresaId);
    if (limiteOpt.isEmpty()) return;

    int limite = limiteOpt.get();
    String referenciaKey = productoId + ":" + almacenId;

    Optional<SgNotificacion> existente =
        notificacionRepository.findByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId(
            MODULO, TIPO, referenciaKey, empresaId, ESTADO_ACT);

    if (cantidadActual < limite) {
      if (existente.isEmpty()) {
        SgNotificacion notif = new SgNotificacion();
        notif.setEmpresaId(empresaId);
        notif.setSucursalId(sucursalId);
        notif.setModulo(MODULO);
        notif.setTipo(TIPO);
        notif.setTitulo("Stock bajo: producto #" + productoId);
        notif.setDescripcion(
            "El producto #"
                + productoId
                + " en almacén #"
                + almacenId
                + " tiene "
                + cantidadActual
                + " unidades (límite: "
                + limite
                + ")");
        notif.setReferenciaId(productoId);
        notif.setReferenciaTipo("MgProducto");
        notif.setReferenciaKey(referenciaKey);
        notif.setPayload(
            Map.of(
                "productoId", productoId,
                "almacenId", almacenId,
                "cantidadActual", cantidadActual,
                "limite", limite));
        notif.setMenuUrlOrigen(MENU_URL);
        notif.setEstadoId(ESTADO_ACT);
        notif.setFechaReg(LocalDateTime.now());
        notif.setUsuarioReg(USUARIO_SISTEMA);
        notificacionRepository.save(notif);
        sseService.push(empresaId, sucursalId);

        log.info(
            "Notificación STOCK_BAJO creada: productoId={} almacenId={} cantidad={} limite={}",
            productoId,
            almacenId,
            cantidadActual,
            limite);
      } else {
        // Actualizar cantidad en el payload de la notificación existente
        SgNotificacion notif = existente.get();
        notif.setDescripcion(
            "El producto #"
                + productoId
                + " en almacén #"
                + almacenId
                + " tiene "
                + cantidadActual
                + " unidades (límite: "
                + limite
                + ")");
        notif.setPayload(
            Map.of(
                "productoId", productoId,
                "almacenId", almacenId,
                "cantidadActual", cantidadActual,
                "limite", limite));
        notificacionRepository.save(notif);
      }
    } else {
      existente.ifPresent(
          notif -> {
            notif.setEstadoId(ESTADO_CER);
            notif.setFechaCierre(LocalDateTime.now());
            notif.setUsuarioCierre(USUARIO_SISTEMA);
            notificacionRepository.save(notif);
            log.info(
                "Notificación STOCK_BAJO cerrada: productoId={} almacenId={}",
                productoId,
                almacenId);
          });
    }
  }
}
