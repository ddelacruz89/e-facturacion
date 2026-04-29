package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.dao.inventario.InOrdenEntradaDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InOrdenEntradaService;
import com.braintech.eFacturador.jpa.inventario.InLote;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntradaDetalle;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntradaDetalleLote;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class InOrdenEntradaServiceImpl implements InOrdenEntradaService {

  private final InOrdenEntradaDao inOrdenEntradaDao;
  private final InLoteDao inLoteDao;
  private final SgSucursalRepository sgSucursalRepository;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public InOrdenEntrada save(InOrdenEntrada ordenEntrada) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    SgSucursal sucursal =
        sgSucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    ordenEntrada.setEmpresaId(empresaId);
    ordenEntrada.setSucursalId(sucursal);

    fixEntityGraph(ordenEntrada, empresaId, sucursalId, sucursal, username);

    return inOrdenEntradaDao.save(ordenEntrada);
  }

  @Override
  public InOrdenEntrada findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inOrdenEntradaDao.findById(id, empresaId).orElse(null);
  }

  @Override
  public List<InOrdenEntrada> findAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inOrdenEntradaDao.findAll(empresaId);
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    inOrdenEntradaDao.disableById(id, empresaId);
  }

  @Override
  public Page<InOrdenEntradaResumenDTO> searchByCriteria(InOrdenEntradaSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inOrdenEntradaDao.searchByCriteria(criteria, empresaId);
  }

  // ── helpers ───────────────────────────────────────────────────────────────────

  /**
   * Corrige el grafo de entidades que viene del frontend desserializado:
   *
   * <ul>
   *   <li>Cada detalle apunta de vuelta al padre real (no a la copia transitoria del JSON).
   *   <li>Cada detalle-lote apunta de vuelta a su detalle real.
   *   <li>Cada InLote recibe su productoId (no viene del frontend) y se crea solo si no existe.
   * </ul>
   */
  private void fixEntityGraph(
      InOrdenEntrada ordenEntrada,
      Integer empresaId,
      Integer sucursalId,
      SgSucursal sucursal,
      String username) {

    List<InOrdenEntradaDetalle> detalles = ordenEntrada.getInOrdenDetalleList();
    if (detalles == null) return;

    for (InOrdenEntradaDetalle detalle : detalles) {
      // Reasignar el back-reference al padre real (no al objeto transitorio deserializado)
      detalle.setOrdenEntradaId(ordenEntrada);

      List<InOrdenEntradaDetalleLote> lotes = detalle.getInOrdenDetalleLotes();
      if (lotes == null) continue;

      for (InOrdenEntradaDetalleLote detalleLote : lotes) {
        detalleLote.setOrdenEntradaDetalle(detalle);
        detalleLote.setUsuarioReg(username);

        InLote loteData = detalleLote.getInLotes();
        if (loteData == null) continue;

        // El frontend no envía productoId dentro de InLote — lo tomamos del detalle padre
        loteData.setProductoId(detalle.getProductoId());

        Long productoLongId = detalle.getProductoId().getId().longValue();

        // Find-or-create: solo crear si el lote no existe aún
        InLote managed =
            inLoteDao
                .findById(loteData.getLote(), productoLongId, empresaId, sucursalId)
                .orElseGet(
                    () -> {
                      loteData.setEmpresaId(empresaId);
                      loteData.setSucursalId(sucursal);
                      loteData.setUsuarioReg(username);
                      loteData.setFechaReg(LocalDateTime.now());
                      loteData.setEstadoId("ACT");
                      return inLoteDao.save(loteData);
                    });

        detalleLote.setInLotes(managed);
      }
    }
  }
}
