package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InAlmacenDao;
import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.dao.inventario.InTransferenciaRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InTransferenciaDetalleRequestDTO;
import com.braintech.eFacturador.dto.inventario.InTransferenciaRequestDTO;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InTransferenciaService;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import com.braintech.eFacturador.jpa.inventario.InInventario;
import com.braintech.eFacturador.jpa.inventario.InLote;
import com.braintech.eFacturador.jpa.inventario.InTransferencia;
import com.braintech.eFacturador.jpa.inventario.InTransferenciaDetalle;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
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

  private final InTransferenciaRepository inTransferenciaRepository;
  private final InAlmacenDao inAlmacenDao;
  private final MgProductoRepository mgProductoRepository;
  private final InInventarioRepository inInventarioRepository;
  private final InLoteDao inLoteDao;
  private final SgSucursalRepository sgSucursalRepository;
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
    validarStock(requestDTO.getDetalles(), origen.getId(), empresaId, sucursalId);

    InTransferencia transferencia = new InTransferencia();
    transferencia.setOrigenAlmacenId(origen);
    transferencia.setDestinoAlmacenId(destino);
    transferencia.setEstadoId(requestDTO.getEstadoId() != null ? requestDTO.getEstadoId() : "PEN");
    transferencia.setEmpresaId(empresaId);
    transferencia.setUsuarioReg(username);
    transferencia.setFechaReg(LocalDateTime.now());
    transferencia.setDetalles(buildDetalles(requestDTO.getDetalles(), transferencia, empresaId));

    InTransferencia saved = inTransferenciaRepository.save(transferencia);
    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  @Transactional
  public Response<?> update(Integer id, InTransferenciaRequestDTO requestDTO) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    InTransferencia existing =
        inTransferenciaRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Transferencia no encontrada"));

    InAlmacen origen = resolveAlmacen(requestDTO.getOrigenAlmacenId(), empresaId, "origen");
    InAlmacen destino = resolveAlmacen(requestDTO.getDestinoAlmacenId(), empresaId, "destino");

    validarAlmacenesDistintos(origen.getId(), destino.getId());
    validarStock(requestDTO.getDetalles(), origen.getId(), empresaId, sucursalId);

    existing.setOrigenAlmacenId(origen);
    existing.setDestinoAlmacenId(destino);
    if (requestDTO.getEstadoId() != null) existing.setEstadoId(requestDTO.getEstadoId());

    if (requestDTO.getDetalles() != null) {
      existing.getDetalles().clear();
      existing.getDetalles().addAll(buildDetalles(requestDTO.getDetalles(), existing, empresaId));
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
    double stock = resolveStock(productoId, almacenId, empresaId, sucursalId);

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
          "El almacén origen y el almacén destino no pueden ser el mismo");
    }
  }

  private void validarStock(
      List<InTransferenciaDetalleRequestDTO> detalles,
      Integer almacenId,
      Integer empresaId,
      Integer sucursalId) {
    if (detalles == null) return;
    for (InTransferenciaDetalleRequestDTO dto : detalles) {
      double stock = resolveStock(dto.getProductoId(), almacenId, empresaId, sucursalId);

      if (dto.getCant() > stock) {
        MgProducto producto =
            mgProductoRepository
                .findByIdAndEmpresaId(dto.getProductoId(), empresaId)
                .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));
        throw new ApplicationException(
            String.format(
                "Stock insuficiente para '%s': disponible %.0f, solicitado %d",
                producto.getNombreProducto(), stock, dto.getCant()));
      }
    }
  }

  // ── helpers ───────────────────────────────────────────────────────────────────

  private double resolveStock(
      Integer productoId, Integer almacenId, Integer empresaId, Integer sucursalId) {
    return inInventarioRepository
        .findByProductoAndAlmacen(productoId, almacenId, empresaId, sucursalId)
        .map(InInventario::getCantidad)
        .orElse(0.0);
  }

  private InAlmacen resolveAlmacen(Integer almacenId, Integer empresaId, String nombre) {
    return inAlmacenDao
        .findByIdAndEmpresaId(almacenId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Almacén " + nombre + " no encontrado"));
  }

  private List<InTransferenciaDetalle> buildDetalles(
      List<InTransferenciaDetalleRequestDTO> dtoDetalles,
      InTransferencia transferencia,
      Integer empresaId) {

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

      if (dto.getLote() != null && !dto.getLote().isBlank()) {
        resolveLote(dto.getLote(), producto, empresaId, sucursalId, username);
      }

      InTransferenciaDetalle detalle = new InTransferenciaDetalle();
      detalle.setTransferenciaId(transferencia);
      detalle.setProductoId(producto);
      detalle.setCant(dto.getCant());
      detalle.setLote(dto.getLote());
      detalle.setNumeroReferencia(dto.getNumeroReferencia());
      detalle.setCantidadUnidad(dto.getCantidadUnidad());
      detalle.setUnidadDescripcion(dto.getUnidadDescripcion());
      detalles.add(detalle);
    }
    return detalles;
  }

  /**
   * Find-or-create an InLote row. If a lote with the same code, product, company and branch already
   * exists it is returned as-is. Otherwise a new row is created and saved.
   */
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
}
