package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.dao.inventario.InOrdenEntradaDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoService;
import com.braintech.eFacturador.interfaces.inventario.InOrdenEntradaService;
import com.braintech.eFacturador.jpa.inventario.InLote;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntradaDetalle;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntradaDetalleLote;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class InOrdenEntradaServiceImpl implements InOrdenEntradaService {

  /** tipo_movimiento_id = 13 - Entrada por Orden de Entrada. */
  private static final int TIPO_ENTRADA_ORDEN = 13;

  private final InOrdenEntradaDao inOrdenEntradaDao;
  private final InLoteDao inLoteDao;
  private final SgSucursalRepository sgSucursalRepository;
  private final TenantContext tenantContext;
  private final InMovimientoService movimientoService;

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
    calcularCantidadesFraccionarias(ordenEntrada);

    InOrdenEntrada saved = inOrdenEntradaDao.save(ordenEntrada);

    generarMovimientos(saved);

    return saved;
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

  // ── helpers ────────────────────────────────────────────────────────────────

  /**
   * Para cada detalle calcula cantidadFraccionaria: cantidad x unidadCantidad cuando el producto es
   * fraccionario (unidadCantidad mayor a 1), o igual a cantidad para productos enteros.
   */
  private void calcularCantidadesFraccionarias(InOrdenEntrada ordenEntrada) {
    List<InOrdenEntradaDetalle> detalles = ordenEntrada.getInOrdenDetalleList();
    if (detalles == null) return;
    for (InOrdenEntradaDetalle detalle : detalles) {
      int cantidad = detalle.getCantidad() != null ? detalle.getCantidad() : 0;
      int factor =
          (detalle.getUnidadCantidad() != null && detalle.getUnidadCantidad() > 1)
              ? detalle.getUnidadCantidad()
              : 1;
      detalle.setCantidadFraccionaria(cantidad * factor);
    }
  }

  /**
   * Genera un InMovimiento de entrada (tipo 13) por cada linea de lote. La cantidad del movimiento
   * se expresa en unidad de fraccion: lote.cantidad x factor donde factor = unidadCantidad del
   * detalle (minimo 1). Ejemplo: 5 Cajas con factor 10 registra 50 Unidades en inventario.
   */
  private void generarMovimientos(InOrdenEntrada ordenEntrada) {
    List<InOrdenEntradaDetalle> detalles = ordenEntrada.getInOrdenDetalleList();
    if (detalles == null || detalles.isEmpty()) return;

    List<InMovimiento> movimientos = new ArrayList<>();

    for (InOrdenEntradaDetalle detalle : detalles) {
      List<InOrdenEntradaDetalleLote> lotes = detalle.getInOrdenDetalleLotes();
      if (lotes == null || lotes.isEmpty()) continue;

      Integer productoId = detalle.getProductoId().getId();
      int factor =
          (detalle.getUnidadCantidad() != null && detalle.getUnidadCantidad() > 1)
              ? detalle.getUnidadCantidad()
              : 1;

      for (InOrdenEntradaDetalleLote detalleLote : lotes) {
        int cantLote = detalleLote.getCantidad() != null ? detalleLote.getCantidad() : 0;
        if (cantLote <= 0) continue;

        String lote = detalleLote.getInLotes() != null ? detalleLote.getInLotes().getLote() : null;

        InMovimiento mov = new InMovimiento();
        mov.setTipoMovimientoId(TIPO_ENTRADA_ORDEN);
        mov.setAlmacenId(ordenEntrada.getAlmacenId());
        mov.setProductoId(productoId);
        mov.setLote(lote);
        mov.setCantidad(cantLote * factor);
        mov.setPrecioUnitario(detalle.getPrecioUnitario());
        mov.setNumeroReferencia(ordenEntrada.getId());

        movimientos.add(mov);
      }
    }

    if (!movimientos.isEmpty()) {
      movimientoService.registrarTodos(movimientos);
    }
  }

  /**
   * Corrige el grafo de entidades deserializado desde el frontend: back-references, lotes
   * find-or-create.
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
      detalle.setOrdenEntradaId(ordenEntrada);

      List<InOrdenEntradaDetalleLote> lotes = detalle.getInOrdenDetalleLotes();
      if (lotes == null) continue;

      for (InOrdenEntradaDetalleLote detalleLote : lotes) {
        detalleLote.setOrdenEntradaDetalle(detalle);
        detalleLote.setUsuarioReg(username);

        InLote loteData = detalleLote.getInLotes();
        if (loteData == null) continue;

        loteData.setProductoId(detalle.getProductoId());
        Long productoLongId = detalle.getProductoId().getId().longValue();

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
