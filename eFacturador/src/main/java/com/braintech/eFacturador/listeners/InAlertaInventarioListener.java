package com.braintech.eFacturador.listeners;

import com.braintech.eFacturador.dao.inventario.InAlertaLimiteRepository;
import com.braintech.eFacturador.dao.inventario.InAlmacenDao;
import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dao.notificacion.SgNotificacionRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.events.InStockBajoEvent;
import com.braintech.eFacturador.jpa.notificacion.SgNotificacion;
import com.braintech.eFacturador.sse.InAlertaSseService;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Procesa alertas de stock bajo de forma asíncrona al recibir un {@link InStockBajoEvent}.
 *
 * <p>Flujo:
 *
 * <ol>
 *   <li>Calcula el stock total real (suma de todos los lotes) para producto+almacén.
 *   <li>Lee el límite mínimo configurado para ese producto/almacén/empresa.
 *   <li>Si no hay límite → no hace nada.
 *   <li>Si {@code totalStock < limite} → crea notificación STOCK_BAJO (si no existe) y marca
 *       estadoProductoInventario = 'BAJO'.
 *   <li>Si {@code totalStock >= limite} → cierra la notificación activa (si existe) y marca
 *       estadoProductoInventario = 'SALUDABLE'.
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
  private static final String ESTADO_BAJO = "BAJO";
  private static final String ESTADO_SALUDABLE = "SALUDABLE";
  private static final String USUARIO_SISTEMA = "SISTEMA";
  private static final String MENU_URL = "/almacenes";

  private final SgNotificacionRepository notificacionRepository;
  private final InAlertaLimiteRepository limiteRepository;
  private final InInventarioRepository inventarioRepository;
  private final InAlmacenDao almacenDao;
  private final MgProductoRepository productoRepository;
  private final InAlertaSseService sseService;

  @Async("alertasExecutor")
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void onStockMovimiento(InStockBajoEvent event) {
    try {
      procesarAlertaStock(
          event.getProductoId(), event.getAlmacenId(), event.getEmpresaId(), event.getSucursalId());
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
      Integer productoId, Integer almacenId, Integer empresaId, Integer sucursalId) {

    Optional<Integer> limiteOpt = limiteRepository.findLimite(productoId, almacenId, empresaId);
    if (limiteOpt.isEmpty()) return;

    int limite = limiteOpt.get();
    int totalStock =
        inventarioRepository.sumCantidadByProductoAndAlmacen(productoId, almacenId, empresaId);

    String productoNombre = resolveProductoNombre(productoId);
    String almacenNombre = resolveAlmacenNombre(almacenId, empresaId);
    String referenciaKey = productoId + ":" + almacenId;

    Optional<SgNotificacion> existente =
        notificacionRepository.findByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId(
            MODULO, TIPO, referenciaKey, empresaId, ESTADO_ACT);

    if (totalStock < limite) {
      if (existente.isEmpty()) {
        // ── Primera vez que baja del límite: marcar BAJO + crear alerta ──────
        inventarioRepository.updateEstadoByProductoAndAlmacen(
            productoId, almacenId, empresaId, ESTADO_BAJO);

        SgNotificacion notif = new SgNotificacion();
        notif.setEmpresaId(empresaId);
        notif.setSucursalId(sucursalId);
        notif.setModulo(MODULO);
        notif.setTipo(TIPO);
        notif.setTitulo("Stock bajo: " + productoNombre + " en " + almacenNombre);
        notif.setDescripcion(buildDescripcion(productoNombre, almacenNombre, totalStock, limite));
        notif.setReferenciaId(productoId);
        notif.setReferenciaTipo("MgProducto");
        notif.setReferenciaKey(referenciaKey);
        notif.setPayload(
            buildPayload(productoId, productoNombre, almacenId, almacenNombre, totalStock, limite));
        notif.setMenuUrlOrigen(MENU_URL);
        notif.setEstadoId(ESTADO_ACT);
        notif.setFechaReg(LocalDateTime.now());
        notif.setUsuarioReg(USUARIO_SISTEMA);
        notificacionRepository.save(notif);
        sseService.push(empresaId, sucursalId);

        log.info(
            "STOCK_BAJO creado: {} en {} cantidad={} limite={}",
            productoNombre,
            almacenNombre,
            totalStock,
            limite);
      } else {
        // ── Ya estaba bajo: solo refrescar cantidad en el payload ─────────────
        SgNotificacion notif = existente.get();
        notif.setDescripcion(buildDescripcion(productoNombre, almacenNombre, totalStock, limite));
        notif.setPayload(
            buildPayload(productoId, productoNombre, almacenId, almacenNombre, totalStock, limite));
        notificacionRepository.save(notif);
      }
    } else {
      // ── Stock saludable ───────────────────────────────────────────────────
      // Si no había notificación activa → todo estaba bien, no hay nada que hacer
      if (existente.isEmpty()) return;

      // Transición BAJO → SALUDABLE: cerrar alerta y actualizar estado
      inventarioRepository.updateEstadoByProductoAndAlmacen(
          productoId, almacenId, empresaId, ESTADO_SALUDABLE);

      SgNotificacion notif = existente.get();
      notif.setEstadoId(ESTADO_CER);
      notif.setFechaCierre(LocalDateTime.now());
      notif.setUsuarioCierre(USUARIO_SISTEMA);
      notificacionRepository.save(notif);
      log.info("STOCK_BAJO cerrado: {} en {}", productoNombre, almacenNombre);
    }
  }

  private String buildDescripcion(
      String productoNombre, String almacenNombre, int totalStock, int limite) {
    return productoNombre
        + " tiene "
        + totalStock
        + " unidades en "
        + almacenNombre
        + " (límite mínimo: "
        + limite
        + ")";
  }

  private Map<String, Object> buildPayload(
      Integer productoId,
      String productoNombre,
      Integer almacenId,
      String almacenNombre,
      int totalStock,
      int limite) {
    return Map.of(
        "productoId", productoId,
        "productoNombre", productoNombre,
        "almacenId", almacenId,
        "almacenNombre", almacenNombre,
        "cantidadActual", totalStock,
        "limite", limite);
  }

  private String resolveProductoNombre(Integer productoId) {
    return productoRepository
        .findById(productoId)
        .map(p -> p.getNombreProducto())
        .orElse("Producto #" + productoId);
  }

  private String resolveAlmacenNombre(Integer almacenId, Integer empresaId) {
    return almacenDao
        .findByIdAndEmpresaId(almacenId, empresaId)
        .map(a -> a.getNombre())
        .orElse("Almacén #" + almacenId);
  }
}
