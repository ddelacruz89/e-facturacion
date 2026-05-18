package com.braintech.eFacturador.scheduler;

import com.braintech.eFacturador.dao.inventario.InAlertaInventarioRepository;
import com.braintech.eFacturador.jpa.inventario.InAlertaInventario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Job diario que recorre TODOS los tenants buscando lotes próximos a vencer y genera (o actualiza)
 * alertas de tipo {@code VENCIMIENTO} en {@code in_alerta_inventario}.
 *
 * <p>Criterio de activación (cualquiera):
 *
 * <ul>
 *   <li>{@code fecha_alerta_vencimiento} ≤ hoy (fecha de alerta explícita).
 *   <li>{@code fecha_vencimiento - alertas_dias days} ≤ hoy (calculado por PostgreSQL).
 *   <li>{@code fecha_vencimiento} ≤ hoy (ya vencido).
 * </ul>
 *
 * <p>No usa TenantContext (no hay request HTTP), por lo que consulta directamente con native query
 * sin filtro de tenant y procesa cada fila con sus propios valores.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InLoteVencimientoScheduler {

  private static final String TIPO_VENCIMIENTO = "VENCIMIENTO";
  private static final String ESTADO_ACT = "ACT";
  private static final String ESTADO_CER = "CER";
  private static final String USUARIO_SISTEMA = "SISTEMA";

  @PersistenceContext private EntityManager entityManager;

  private final InAlertaInventarioRepository alertaRepository;

  /** Corre cada día a las 06:00 AM. Ajustar cron según zona horaria del servidor. */
  @Scheduled(cron = "0 0 6 * * *")
  @Transactional
  public void verificarVencimientos() {
    log.info(">> InLoteVencimientoScheduler: iniciando verificación de lotes por vencer");

    List<Object[]> lotesPorVencer = buscarLotesPorVencer();
    int creadas = 0;
    int yaExistentes = 0;

    for (Object[] row : lotesPorVencer) {
      String lote = (String) row[0];
      Integer productoId = (Integer) row[1];
      Integer empresaId = (Integer) row[2];
      Integer sucursalId = (Integer) row[3];
      // fecha_vencimiento puede venir como java.sql.Date
      LocalDate fechaVenc = row[4] != null ? ((java.sql.Date) row[4]).toLocalDate() : null;

      Optional<InAlertaInventario> existente =
          alertaRepository.findByTipoAndLoteAndProductoIdAndEmpresaIdAndEstadoId(
              TIPO_VENCIMIENTO, lote, productoId, empresaId, ESTADO_ACT);

      if (existente.isEmpty()) {
        crearAlertaVencimiento(lote, productoId, empresaId, sucursalId, fechaVenc);
        creadas++;
      } else {
        yaExistentes++;
      }
    }

    log.info(
        "<< InLoteVencimientoScheduler: {} alertas creadas, {} ya existían", creadas, yaExistentes);
  }

  /**
   * Native query que busca lotes activos cuyo vencimiento se ha alcanzado según cualquiera de los
   * tres criterios, y que aún no tienen alerta activa. Al no filtrar por tenant, procesa todas las
   * empresas/sucursales.
   */
  @SuppressWarnings("unchecked")
  private List<Object[]> buscarLotesPorVencer() {
    return entityManager
        .createNativeQuery(
            """
        SELECT
            l.lote,
            l.producto_id,
            l.empresa_id,
            l.sucursal_id,
            l.fecha_vencimiento
        FROM inventario.in_lote l
        WHERE l.estado_id = 'ACT'
          AND l.fecha_vencimiento IS NOT NULL
          AND (
              -- Fecha de alerta explícita alcanzada
              (l.fecha_alerta_vencimiento IS NOT NULL
               AND l.fecha_alerta_vencimiento <= CURRENT_DATE)
              OR
              -- Ventana calculada por alertas_dias
              (l.alertas_dias IS NOT NULL
               AND l.fecha_vencimiento - (l.alertas_dias || ' days')::interval <= NOW())
              OR
              -- Ya vencido
              l.fecha_vencimiento <= NOW()
          )
          AND NOT EXISTS (
              SELECT 1
              FROM inventario.in_alerta_inventario a
              WHERE a.lote        = l.lote
                AND a.producto_id = l.producto_id
                AND a.empresa_id  = l.empresa_id
                AND a.tipo        = 'VENCIMIENTO'
                AND a.estado_id   = 'ACT'
          )
        """)
        .getResultList();
  }

  private void crearAlertaVencimiento(
      String lote,
      Integer productoId,
      Integer empresaId,
      Integer sucursalId,
      LocalDate fechaVencimiento) {

    // Resolver SgSucursal — si no existe, omitir (dato inconsistente)
    var sucursalOpt =
        entityManager.find(com.braintech.eFacturador.jpa.seguridad.SgSucursal.class, sucursalId);
    if (sucursalOpt == null) {
      log.warn(
          "Sucursal {} no encontrada al crear alerta de vencimiento para lote={}",
          sucursalId,
          lote);
      return;
    }

    InAlertaInventario alerta = new InAlertaInventario();
    alerta.setTipo(TIPO_VENCIMIENTO);
    alerta.setLote(lote);
    alerta.setProductoId(productoId);
    alerta.setFechaVencimiento(fechaVencimiento);
    alerta.setEmpresaId(empresaId);
    alerta.setSucursalId(sucursalOpt);
    alerta.setEstadoId(ESTADO_ACT);
    alerta.setUsuarioReg(USUARIO_SISTEMA);
    alerta.setFechaReg(LocalDateTime.now());
    alertaRepository.save(alerta);

    log.info(
        "Alerta VENCIMIENTO creada: lote={} productoId={} fechaVenc={} empresa={}",
        lote,
        productoId,
        fechaVencimiento,
        empresaId);
  }
}
