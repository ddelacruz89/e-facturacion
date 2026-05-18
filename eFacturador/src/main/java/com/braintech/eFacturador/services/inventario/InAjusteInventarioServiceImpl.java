package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InAjusteInventarioDao;
import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dao.inventario.InMovimientoTipoRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioDetalleRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockActualDTO;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InAjusteInventarioService;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoService;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventario;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventarioDetalle;
import com.braintech.eFacturador.jpa.inventario.InInventario;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import com.braintech.eFacturador.jpa.inventario.InMovimientoTipo;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InAjusteInventarioServiceImpl implements InAjusteInventarioService {

  /** ID de fallback para el tipo de movimiento cuando el request no lo especifica. */
  private static final Integer TIPO_MOV_AJUSTE_DEFAULT = 3;

  private final InAjusteInventarioDao ajusteDao;
  private final InInventarioRepository inventarioRepository;
  private final InMovimientoTipoRepository movimientoTipoRepository;
  private final InMovimientoService movimientoService;
  private final MgProductoRepository productoRepository;
  private final SgSucursalRepository sucursalRepository;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public InAjusteInventario aplicar(InAjusteInventarioRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    SgSucursal sucursal =
        sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    // ── Construir cabecera ────────────────────────────────────────────────────
    InAjusteInventario ajuste = new InAjusteInventario();
    ajuste.setEmpresaId(empresaId);
    ajuste.setSucursalId(sucursal);
    ajuste.setUsuarioReg(username);
    ajuste.setFechaReg(LocalDateTime.now());
    ajuste.setAlmacenId(request.getAlmacenId());
    Integer tipoId =
        request.getMovimientoTipoId() != null
            ? request.getMovimientoTipoId()
            : TIPO_MOV_AJUSTE_DEFAULT;
    ajuste.setMovimientoTipoId(tipoId);
    ajuste.setObservacion(request.getObservacion());
    ajuste.setEstadoId("APL");

    // ── Validar dirección según cr del tipo de movimiento ────────────────────
    InMovimientoTipo tipo =
        movimientoTipoRepository
            .findById(tipoId)
            .orElseThrow(
                () -> new RecordNotFoundException("Tipo de movimiento no encontrado: " + tipoId));
    boolean cr = Boolean.TRUE.equals(tipo.getCr());

    // ── Construir detalles y aplicar cambios de inventario ───────────────────
    List<InAjusteInventarioDetalle> detalles = new ArrayList<>();
    List<InMovimiento> movimientos = new ArrayList<>();

    for (InAjusteInventarioDetalleRequestDTO dto : request.getDetalles()) {

      // Buscar registro de inventario actual
      InInventario inv =
          inventarioRepository
              .findByProductoAlmacenLote(
                  dto.getProductoId(), request.getAlmacenId(), empresaId, sucursalId, dto.getLote())
              .orElseThrow(
                  () ->
                      new RecordNotFoundException(
                          "Inventario no encontrado para productoId="
                              + dto.getProductoId()
                              + " lote="
                              + dto.getLote()));

      int cantidadActual = inv.getCantidad() != null ? inv.getCantidad() : 0;
      int diferencia = dto.getCantidadNueva() - cantidadActual;

      // Validar dirección según cr:
      //   cr=true  (crédito/entrada) → diferencia debe ser >= 0 (solo aumentar)
      //   cr=false (débito/salida)   → diferencia debe ser <= 0 (solo reducir)
      if (cr && diferencia < 0) {
        throw new ApplicationException(
            "El motivo '"
                + tipo.getTipoMovimiento()
                + "' solo permite aumentar el stock. "
                + "Producto ID "
                + dto.getProductoId()
                + ": stock actual="
                + cantidadActual
                + ", nuevo="
                + dto.getCantidadNueva());
      }
      if (!cr && diferencia > 0) {
        throw new ApplicationException(
            "El motivo '"
                + tipo.getTipoMovimiento()
                + "' solo permite reducir el stock. "
                + "Producto ID "
                + dto.getProductoId()
                + ": stock actual="
                + cantidadActual
                + ", nuevo="
                + dto.getCantidadNueva());
      }

      // in_inventarios NO se actualiza aquí.
      // El trigger trg_actualiza_inventario (BEFORE INSERT en in_movimientos)
      // lo hace atómicamente y calcula cantidad_inventario en la fila del movimiento.

      // Detalle del ajuste
      InAjusteInventarioDetalle detalle = new InAjusteInventarioDetalle();
      detalle.setAjuste(ajuste);
      detalle.setProductoId(dto.getProductoId());
      detalle.setLote(dto.getLote());
      detalle.setCantidadActual(cantidadActual);
      detalle.setCantidadNueva(dto.getCantidadNueva());
      detalle.setDiferencia(diferencia);
      detalles.add(detalle);

      // Movimiento de inventario — el trigger asigna cantidad_inventario
      InMovimiento mov = new InMovimiento();
      mov.setTipoMovimientoId(ajuste.getMovimientoTipoId());
      mov.setAlmacenId(request.getAlmacenId());
      mov.setProductoId(dto.getProductoId());
      mov.setLote(dto.getLote());
      mov.setCantidad(diferencia); // delta firmado; trigger normaliza signo con cr
      mov.setObservacion(request.getObservacion());
      movimientos.add(mov);
    }

    ajuste.setDetalles(detalles);

    // Guardar cabecera + detalles (cascade ALL)
    InAjusteInventario saved = ajusteDao.save(ajuste);

    // Enlazar cada movimiento al ajuste que los originó
    movimientos.forEach(m -> m.setNumeroReferencia(saved.getId()));

    // Registrar movimientos en bloque (estampa tenant internamente)
    movimientoService.registrarTodos(movimientos);

    return saved;
  }

  @Override
  public Page<InAjusteInventarioResumenDTO> buscar(InAjusteInventarioSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return ajusteDao.buscar(criteria, empresaId, sucursalId);
  }

  @Override
  public InAjusteInventario findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return ajusteDao
        .findById(id, empresaId, sucursalId)
        .orElseThrow(() -> new RecordNotFoundException("Ajuste no encontrado: " + id));
  }

  @Override
  public List<InAjusteInventarioResumenDTO> findByAlmacen(Integer almacenId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return ajusteDao.findByAlmacen(almacenId, empresaId, sucursalId);
  }

  @Override
  public InStockActualDTO getStockActual(Integer productoId, Integer almacenId, String lote) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    InInventario inv =
        inventarioRepository
            .findByProductoAlmacenLote(productoId, almacenId, empresaId, sucursalId, lote)
            .orElse(null);

    MgProducto producto =
        productoRepository
            .findById(productoId)
            .orElseThrow(
                () -> new RecordNotFoundException("Producto no encontrado: " + productoId));

    int cantidad = (inv != null && inv.getCantidad() != null) ? inv.getCantidad() : 0;

    return new InStockActualDTO(
        productoId, producto.getNombreProducto(), almacenId, lote, cantidad);
  }

  @Override
  public List<String> getLotesByProductoAndAlmacen(Integer productoId, Integer almacenId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return inventarioRepository.findLotesByProductoAndAlmacen(
        productoId, almacenId, empresaId, sucursalId);
  }
}
