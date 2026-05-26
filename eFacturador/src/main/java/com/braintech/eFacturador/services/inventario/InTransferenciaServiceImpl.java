package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InAlmacenDao;
import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.dao.inventario.InRequisicionDao;
import com.braintech.eFacturador.dao.inventario.InTransferenciaRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InTransferenciaDetalleRequestDTO;
import com.braintech.eFacturador.dto.inventario.InTransferenciaRequestDTO;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoService;
import com.braintech.eFacturador.interfaces.inventario.InTransferenciaService;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import com.braintech.eFacturador.jpa.inventario.InLote;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import com.braintech.eFacturador.jpa.inventario.InRequisicion;
import com.braintech.eFacturador.jpa.inventario.InRequisicionDetalle;
import com.braintech.eFacturador.jpa.inventario.InTransferencia;
import com.braintech.eFacturador.jpa.inventario.InTransferenciaDetalle;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class InTransferenciaServiceImpl implements InTransferenciaService {

  /** Tipo de movimiento: entrada por transferencia. */
  private static final int TIPO_ENTRADA_TRANSFERENCIA = 2;

  /** Tipo de movimiento: salida por transferencia. */
  private static final int TIPO_SALIDA_TRANSFERENCIA = 3;

  private final InTransferenciaRepository inTransferenciaRepository;
  private final InRequisicionDao inRequisicionDao;
  private final InAlmacenDao inAlmacenDao;
  private final MgProductoRepository mgProductoRepository;
  private final InInventarioRepository inInventarioRepository;
  private final InLoteDao inLoteDao;
  private final SgSucursalRepository sgSucursalRepository;
  private final InMovimientoService movimientoService;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public Response<?> create(InTransferenciaRequestDTO requestDTO) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    InAlmacen origen = resolveAlmacen(requestDTO.getOrigenAlmacenId(), empresaId, "origen");
    InAlmacen destino = resolveAlmacen(requestDTO.getDestinoAlmacenId(), empresaId, "destino");

    validarAlmacenesDistintos(origen.getId(), destino.getId());

    // ── 1. Guardar transferencia (cant se ajusta al stock real en buildDetalles) ───
    InTransferencia transferencia = new InTransferencia();
    transferencia.setOrigenAlmacenId(origen);
    transferencia.setDestinoAlmacenId(destino);
    transferencia.setEstadoId(requestDTO.getEstadoId() != null ? requestDTO.getEstadoId() : "PEN");
    transferencia.setEmpresaId(empresaId);
    transferencia.setSucursalId(new SgSucursal(sucursalId));
    transferencia.setUsuarioReg(username);
    transferencia.setFechaReg(LocalDateTime.now());
    transferencia.setRequisicionId(requestDTO.getRequisicionId());
    transferencia.setDetalles(
        buildDetalles(requestDTO.getDetalles(), transferencia, empresaId, origen.getId()));

    InTransferencia saved = inTransferenciaRepository.save(transferencia);

    // ── 2. Completar requisición de origen si aplica ─────────────────────────
    if (requestDTO.getRequisicionId() != null) {
      completarRequisicion(requestDTO.getRequisicionId(), empresaId, saved.getDetalles());
    }

    // ── 4. Generar movimientos solo para items con cant > 0 ──────────────────
    // El trigger trg_actualiza_inventario actualiza in_inventarios atomicamente al insertar.
    List<InMovimiento> movimientos = new ArrayList<>();
    for (InTransferenciaDetalle det : saved.getDetalles()) {
      if (det.getCant() == null || det.getCant() <= 0) continue;

      Integer productoId = det.getProductoId().getId();
      String lote = (det.getLote() != null && !det.getLote().isBlank()) ? det.getLote() : null;

      // Salida del almacen origen (cantidad negativa)
      InMovimiento salida = new InMovimiento();
      salida.setTipoMovimientoId(TIPO_SALIDA_TRANSFERENCIA);
      salida.setAlmacenId(origen.getId());
      salida.setProductoId(productoId);
      salida.setLote(lote);
      salida.setCantidad(-det.getCant());
      salida.setNumeroReferencia(saved.getId());
      salida.setObservacion("Transferencia #" + saved.getId() + " -> almacen " + destino.getId());
      movimientos.add(salida);

      // Entrada al almacen destino (cantidad positiva)
      InMovimiento entrada = new InMovimiento();
      entrada.setTipoMovimientoId(TIPO_ENTRADA_TRANSFERENCIA);
      entrada.setAlmacenId(destino.getId());
      entrada.setProductoId(productoId);
      entrada.setLote(lote);
      entrada.setCantidad(det.getCant());
      entrada.setNumeroReferencia(saved.getId());
      entrada.setObservacion("Transferencia #" + saved.getId() + " <- almacen " + origen.getId());
      movimientos.add(entrada);
    }

    if (!movimientos.isEmpty()) {
      movimientoService.registrarTodos(movimientos);
    }

    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  @Transactional
  public Response<?> update(Integer id, InTransferenciaRequestDTO requestDTO) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    InTransferencia existing =
        inTransferenciaRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Transferencia no encontrada"));

    InAlmacen origen = resolveAlmacen(requestDTO.getOrigenAlmacenId(), empresaId, "origen");
    InAlmacen destino = resolveAlmacen(requestDTO.getDestinoAlmacenId(), empresaId, "destino");

    validarAlmacenesDistintos(origen.getId(), destino.getId());

    existing.setOrigenAlmacenId(origen);
    existing.setDestinoAlmacenId(destino);
    if (requestDTO.getEstadoId() != null) existing.setEstadoId(requestDTO.getEstadoId());

    if (requestDTO.getDetalles() != null) {
      existing.getDetalles().clear();
      existing
          .getDetalles()
          .addAll(buildDetalles(requestDTO.getDetalles(), existing, empresaId, origen.getId()));
    }

    InTransferencia saved = inTransferenciaRepository.save(existing);
    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  public Response<?> getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inTransferenciaRepository
        .findByIdAndEmpresaId(id, empresaId)
        .<Response<?>>map(t -> Response.builder().status(HttpStatus.OK).content(t).build())
        .orElseGet(
            () ->
                Response.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .error(new DataNotFoundDTO("Transferencia no encontrada"))
                    .build());
  }

  @Override
  public Response<?> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<InTransferencia> data = inTransferenciaRepository.findAllByEmpresaId(empresaId);
    if (data.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("No se encontraron transferencias"))
          .build();
    }
    return Response.builder().status(HttpStatus.OK).content(data).build();
  }

  @Override
  public Response<?> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<InTransferencia> data = inTransferenciaRepository.findAllActiveByEmpresaId(empresaId);
    if (data.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("No se encontraron transferencias activas"))
          .build();
    }
    return Response.builder().status(HttpStatus.OK).content(data).build();
  }

  @Override
  @Transactional
  public Response<?> disable(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    InTransferencia existing =
        inTransferenciaRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Transferencia no encontrada"));

    existing.setEstadoId("INA");
    inTransferenciaRepository.save(existing);
    return Response.builder().status(HttpStatus.OK).content("Transferencia anulada").build();
  }

  @Override
  public Response<?> getStockProductoEnAlmacen(Integer productoId, Integer almacenId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    int stock = resolveStockTotal(productoId, almacenId, empresaId, sucursalId);

    Map<String, Object> result = new HashMap<>();
    result.put("productoId", productoId);
    result.put("almacenId", almacenId);
    result.put("cantidad", stock);
    return Response.builder().status(HttpStatus.OK).content(result).build();
  }

  // ── validaciones ─────────────────────────────────────────────────────────────

  private void validarAlmacenesDistintos(Integer origenId, Integer destinoId) {
    if (origenId.equals(destinoId)) {
      throw new ApplicationException(
          "El almacen origen y el almacen destino no pueden ser el mismo");
    }
  }

  // ── helpers ───────────────────────────────────────────────────────────────────

  /**
   * Stock total del producto en el almacen (sin filtrar por lote). Usado para consultas rapidas.
   */
  private int resolveStockTotal(
      Integer productoId, Integer almacenId, Integer empresaId, Integer sucursalId) {
    return inInventarioRepository
        .findByProductoAndAlmacen(productoId, almacenId, empresaId, sucursalId)
        .map(i -> i.getCantidad() != null ? i.getCantidad() : 0)
        .orElse(0);
  }

  /**
   * Stock disponible para un detalle especifico: si tiene lote, busca ese lote exacto; si no tiene
   * lote, busca el registro sin lote (lote=null).
   */
  private int resolveStockParaDetalle(
      Integer productoId, Integer almacenId, Integer empresaId, Integer sucursalId, String lote) {
    String loteKey = (lote != null && !lote.isBlank()) ? lote : null;
    return inInventarioRepository
        .findByProductoAlmacenLote(productoId, almacenId, empresaId, sucursalId, loteKey)
        .map(i -> i.getCantidad() != null ? i.getCantidad() : 0)
        .orElse(0);
  }

  private InAlmacen resolveAlmacen(Integer almacenId, Integer empresaId, String nombre) {
    return inAlmacenDao
        .findByIdAndEmpresaId(almacenId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Almacen " + nombre + " no encontrado"));
  }

  /**
   * Construye los detalles de la transferencia ajustando cant al stock real disponible al momento
   * de guardar. Si el stock es menor al solicitado, cant queda en el stock disponible y
   * cantSolicitada guarda lo que el usuario pidio originalmente.
   */
  private List<InTransferenciaDetalle> buildDetalles(
      List<InTransferenciaDetalleRequestDTO> dtoDetalles,
      InTransferencia transferencia,
      Integer empresaId,
      Integer origenAlmacenId) {

    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    List<InTransferenciaDetalle> detalles = new ArrayList<>();
    if (dtoDetalles == null) return detalles;

    for (InTransferenciaDetalleRequestDTO dto : dtoDetalles) {
      MgProducto producto =
          mgProductoRepository
              .findByIdAndEmpresaId(dto.getProductoId(), empresaId)
              .orElseThrow(
                  () ->
                      new RecordNotFoundException(
                          "Producto no encontrado: " + dto.getProductoId()));

      // Verificar stock disponible en tiempo real al momento de guardar
      int cantSolicitada = dto.getCant();
      int stockDisponible =
          resolveStockParaDetalle(
              dto.getProductoId(), origenAlmacenId, empresaId, sucursalId, dto.getLote());
      int cantTransferida = Math.min(cantSolicitada, Math.max(0, stockDisponible));

      if (dto.getLote() != null && !dto.getLote().isBlank() && cantTransferida > 0) {
        resolveLote(dto.getLote(), producto, empresaId, sucursalId, username);
      }

      InTransferenciaDetalle detalle = new InTransferenciaDetalle();
      detalle.setTransferenciaId(transferencia);
      detalle.setProductoId(producto);
      detalle.setCantSolicitada(cantSolicitada);
      detalle.setCant(cantTransferida);
      detalle.setLote(dto.getLote());
      detalle.setNumeroReferencia(dto.getNumeroReferencia());
      detalle.setCantidadUnidad(dto.getCantidadUnidad());
      detalle.setUnidadDescripcion(dto.getUnidadDescripcion());
      detalles.add(detalle);
    }
    return detalles;
  }

  private InLote resolveLote(
      String loteCode,
      MgProducto producto,
      Integer empresaId,
      Integer sucursalId,
      String username) {

    return inLoteDao
        .findById(loteCode, producto.getId().longValue(), empresaId, sucursalId)
        .orElseGet(
            () -> {
              SgSucursal sucursal =
                  sgSucursalRepository
                      .findById(sucursalId)
                      .orElseThrow(
                          () ->
                              new RecordNotFoundException("Sucursal no encontrada: " + sucursalId));

              InLote nuevo = new InLote();
              nuevo.setLote(loteCode);
              nuevo.setProductoId(producto);
              nuevo.setEmpresaId(empresaId);
              nuevo.setSucursalId(sucursal);
              nuevo.setEstadoId("ACT");
              nuevo.setUsuarioReg(username);
              nuevo.setFechaReg(LocalDateTime.now());
              return inLoteDao.save(nuevo);
            });
  }

  private void completarRequisicion(
      Integer requisicionId, Integer empresaId, List<InTransferenciaDetalle> detallesTransferidos) {

    InRequisicion req = inRequisicionDao.findById(requisicionId, empresaId).orElse(null);
    if (req == null) return;

    // Acumular cantidades transferidas por productoId
    Map<Integer, BigDecimal> transferidoPorProducto = new HashMap<>();
    for (InTransferenciaDetalle det : detallesTransferidos) {
      if (det.getProductoId() == null || det.getCant() == null || det.getCant() <= 0) continue;
      Integer prodId = det.getProductoId().getId();
      transferidoPorProducto.merge(prodId, BigDecimal.valueOf(det.getCant()), BigDecimal::add);
    }

    // Actualizar cantidadAprobada en cada detalle de la requisición
    for (InRequisicionDetalle detReq : req.getDetalles()) {
      BigDecimal cantTransferida = transferidoPorProducto.get(detReq.getProductoId());
      if (cantTransferida != null) {
        detReq.setCantidadAprobada(cantTransferida);
      }
    }

    req.setEstadoId("COM");
    inRequisicionDao.save(req);
  }

  @Override
  public com.braintech.eFacturador.dto.inventario.InProductoLotesStockDTO getLotesConStockEnAlmacen(
      Integer productoId, Integer almacenId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    List<com.braintech.eFacturador.dto.inventario.InLoteStockItemDTO> lotes =
        inInventarioRepository.findLotesConStockByProductoAndAlmacen(
            productoId, almacenId, empresaId, sucursalId);

    int total = lotes.stream().mapToInt(l -> l.getCantidad() != null ? l.getCantidad() : 0).sum();

    com.braintech.eFacturador.dto.inventario.InProductoLotesStockDTO dto =
        new com.braintech.eFacturador.dto.inventario.InProductoLotesStockDTO();
    dto.setTotalDisponible(total);
    dto.setLotes(lotes);

    mgProductoRepository
        .findById(productoId)
        .ifPresent(
            producto -> {
              List<com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidor> unidades =
                  producto.getUnidadProductorSuplidor();
              if (unidades != null && !unidades.isEmpty()) {
                com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidor u = unidades.get(0);
                if (u.getUnidadId() != null) {
                  dto.setUnidadNombre(u.getUnidadId().getNombre());
                  dto.setUnidadSigla(u.getUnidadId().getSigla());
                }
                if (u.getUnidadFraccionId() != null) {
                  dto.setUnidadFraccionNombre(u.getUnidadFraccionId().getNombre());
                  dto.setUnidadFraccionSigla(u.getUnidadFraccionId().getSigla());
                }
                dto.setCantidadUnidad(u.getCantidad());
              }
            });

    return dto;
  }
}
