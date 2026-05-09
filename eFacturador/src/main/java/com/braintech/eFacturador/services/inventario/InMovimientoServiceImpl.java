package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InMovimientoDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InMovimientoResumenDTO;
import com.braintech.eFacturador.dto.inventario.InMovimientoSearchCriteria;
import com.braintech.eFacturador.events.InStockBajoEvent;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoService;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InMovimientoServiceImpl implements InMovimientoService {

  private final InMovimientoDao movimientoDao;
  private final SgSucursalRepository sucursalRepository;
  private final TenantContext tenantContext;
  private final ApplicationEventPublisher eventPublisher;

  @Override
  @Transactional
  public InMovimiento registrar(InMovimiento movimiento) {
    stampTenant(movimiento);
    InMovimiento saved = movimientoDao.save(movimiento);

    // Publicar evento de stock (procesado async por InAlertaInventarioListener)
    if (saved.getAlmacenId() != null && saved.getProductoId() != null) {
      eventPublisher.publishEvent(
          new InStockBajoEvent(
              this,
              saved.getProductoId(),
              saved.getAlmacenId(),
              saved.getEmpresaId(),
              saved.getSucursalId() != null ? saved.getSucursalId().getId() : null,
              saved.getCantidadInventario()));
    }
    return saved;
  }

  @Override
  @Transactional
  public void registrarTodos(List<InMovimiento> movimientos) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    SgSucursal sucursal =
        sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    LocalDateTime now = LocalDateTime.now();
    for (InMovimiento m : movimientos) {
      m.setEmpresaId(empresaId);
      m.setSucursalId(sucursal);
      m.setUsuarioReg(username);
      m.setFechaReg(now);
    }
    movimientoDao.saveAll(movimientos);

    // Publicar eventos de stock (procesados async por InAlertaInventarioListener)
    for (InMovimiento m : movimientos) {
      if (m.getAlmacenId() != null && m.getProductoId() != null) {
        eventPublisher.publishEvent(
            new InStockBajoEvent(
                this,
                m.getProductoId(),
                m.getAlmacenId(),
                empresaId,
                sucursalId,
                m.getCantidadInventario()));
      }
    }
  }

  @Override
  public InMovimiento findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return movimientoDao
        .findById(id, empresaId, sucursalId)
        .orElseThrow(() -> new RecordNotFoundException("Movimiento no encontrado"));
  }

  @Override
  public Page<InMovimientoResumenDTO> buscar(InMovimientoSearchCriteria criteria) {
    // empresaId siempre del token — nunca del frontend
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    // sucursalId viene en criteria: null = todas las sucursales
    return movimientoDao.searchByCriteria(criteria, empresaId);
  }

  @Override
  public List<InMovimientoResumenDTO> historialProductoAlmacen(
      Integer productoId, Integer almacenId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return movimientoDao.findByProductoAndAlmacen(productoId, almacenId, empresaId, sucursalId);
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  private void stampTenant(InMovimiento m) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    SgSucursal sucursal =
        sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    m.setEmpresaId(empresaId);
    m.setSucursalId(sucursal);
    m.setUsuarioReg(username);
    m.setFechaReg(LocalDateTime.now());
  }
}
