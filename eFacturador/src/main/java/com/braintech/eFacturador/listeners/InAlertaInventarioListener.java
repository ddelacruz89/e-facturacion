package com.braintech.eFacturador.listeners;

import com.braintech.eFacturador.dao.inventario.InAlertaInventarioRepository;
import com.braintech.eFacturador.dao.inventario.InAlertaLimiteRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.events.InStockBajoEvent;
import com.braintech.eFacturador.jpa.inventario.InAlertaInventario;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import java.time.LocalDateTime;
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
 *   <li>Si no hay límite configurado → no hace nada.
 *   <li>Si {@code cantidadActual < limite} → crea una alerta ACT (si no existe ya).
 *   <li>Si {@code cantidadActual >= limite} → cierra la alerta ACT existente (si la hay).
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InAlertaInventarioListener {

  private static final String TIPO_STOCK_BAJO = "STOCK_BAJO";
  private static final String ESTADO_ACT = "ACT";
  private static final String ESTADO_CER = "CER";
  private static final String USUARIO_SISTEMA = "SISTEMA";

  private final InAlertaInventarioRepository alertaRepository;
  private final InAlertaLimiteRepository limiteRepository;
  private final SgSucursalRepository sucursalRepository;

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
      // No propagar — el movimiento ya se guardó; la alerta es best-effort
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

    // 1. Buscar límite configurado
    Optional<Integer> limiteOpt = limiteRepository.findLimite(productoId, almacenId, empresaId);
    if (limiteOpt.isEmpty()) {
      return; // sin límite configurado → no hay nada que verificar
    }
    int limite = limiteOpt.get();

    // 2. Buscar alerta activa existente
    Optional<InAlertaInventario> existente =
        alertaRepository.findByTipoAndProductoIdAndAlmacenIdAndEmpresaIdAndSucursalIdIdAndEstadoId(
            TIPO_STOCK_BAJO, productoId, almacenId, empresaId, sucursalId, ESTADO_ACT);

    if (cantidadActual < limite) {
      // Stock por debajo del límite → crear alerta si no existe
      if (existente.isEmpty()) {
        SgSucursal sucursal = sucursalRepository.findById(sucursalId).orElse(null);
        if (sucursal == null) return;

        InAlertaInventario alerta = new InAlertaInventario();
        alerta.setTipo(TIPO_STOCK_BAJO);
        alerta.setProductoId(productoId);
        alerta.setAlmacenId(almacenId);
        alerta.setCantidadActual(cantidadActual);
        alerta.setLimite(limite);
        alerta.setEmpresaId(empresaId);
        alerta.setSucursalId(sucursal);
        alerta.setEstadoId(ESTADO_ACT);
        alerta.setUsuarioReg(USUARIO_SISTEMA);
        alerta.setFechaReg(LocalDateTime.now());
        alertaRepository.save(alerta);

        log.info(
            "Alerta STOCK_BAJO creada: productoId={} almacenId={} cantidad={} limite={}",
            productoId,
            almacenId,
            cantidadActual,
            limite);
      } else {
        // Actualizar cantidad actual en alerta existente
        InAlertaInventario alerta = existente.get();
        alerta.setCantidadActual(cantidadActual);
        alertaRepository.save(alerta);
      }
    } else {
      // Stock recuperado → cerrar alerta si existe
      existente.ifPresent(
          alerta -> {
            alerta.setEstadoId(ESTADO_CER);
            alerta.setFechaCierre(LocalDateTime.now());
            alerta.setUsuarioCierre(USUARIO_SISTEMA);
            alertaRepository.save(alerta);
            log.info(
                "Alerta STOCK_BAJO cerrada: productoId={} almacenId={}", productoId, almacenId);
          });
    }
  }
}
