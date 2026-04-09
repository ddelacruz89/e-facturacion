package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InOrdenesComprasDao;
import com.braintech.eFacturador.dao.inventario.InOrdenesComprasRepository;
import com.braintech.eFacturador.dao.inventario.InSuplidorRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasDetalleRequestDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasRequestDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSimpleDTO;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InOrdenesComprasService;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntradaDetalle;
import com.braintech.eFacturador.jpa.inventario.InOrdenesCompras;
import com.braintech.eFacturador.jpa.inventario.InOrdenesComprasDetalles;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.annotation.Nonnull;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class InOrdenesComprasServiceImpl implements InOrdenesComprasService {

  private final InOrdenesComprasRepository inOrdenesComprasRepository;
  private final InOrdenesComprasDao inOrdenesComprasDao;
  private final InSuplidorRepository inSuplidorRepository;
  private final MgProductoRepository mgProductoRepository;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public Response<?> create(InOrdenesComprasRequestDTO requestDTO) {
    String username = tenantContext.getCurrentUsername();
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    // Fetch suplidor
    InSuplidor suplidor =
        inSuplidorRepository
            .findByIdAndEmpresaId(requestDTO.getSuplidorId(), empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Suplidor no encontrado"));

    // Create orden compra entity
    InOrdenesCompras ordenCompra = new InOrdenesCompras();
    ordenCompra.setSubTotal(requestDTO.getSubTotal());
    ordenCompra.setItbis(requestDTO.getItbis());
    ordenCompra.setTotal(requestDTO.getTotal());
    ordenCompra.setDescuento(requestDTO.getDescuento());
    ordenCompra.setSuplidorId(suplidor);
    ordenCompra.setEstadoId(requestDTO.getEstadoId() != null ? requestDTO.getEstadoId() : "ACT");
    ordenCompra.setCotizacionId(requestDTO.getCotizacionId());
    ordenCompra.setUsuarioReg(username);
    ordenCompra.setFechaReg(LocalDateTime.now());

    // Map detalles
    List<InOrdenesComprasDetalles> detalles = new ArrayList<>();
    if (requestDTO.getDetalles() != null) {
      for (InOrdenesComprasDetalleRequestDTO detalleDTO : requestDTO.getDetalles()) {
        MgProducto producto =
            mgProductoRepository
                .findByIdAndEmpresaId(detalleDTO.getProductoId(), empresaId)
                .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));

        InOrdenesComprasDetalles detalle = new InOrdenesComprasDetalles();
        detalle.setProductoId(producto);
        detalle.setCantidad(detalleDTO.getCantidad());
        detalle.setPrecioUnitario(detalleDTO.getPrecioUnitario());
        detalle.setItbisProducto(detalleDTO.getItbisProducto());
        detalle.setDescuentoPorciento(detalleDTO.getDescuentoPorciento());
        detalle.setDescuentoCantidad(detalleDTO.getDescuentoCantidad());
        detalle.setSubTotal(detalleDTO.getSubTotal());
        detalle.setItbis(detalleDTO.getItbis());
        detalle.setTotal(detalleDTO.getTotal());
        detalle.setUnidadNombre(detalleDTO.getUnidadNombre());
        detalle.setUnidadCantidad(detalleDTO.getUnidadCantidad());
        detalle.setEstadoId("ACT");
        detalle.setOrdenCompraId(ordenCompra);

        detalles.add(detalle);
      }
    }
    ordenCompra.setDetalles(detalles);

    InOrdenesCompras saved = inOrdenesComprasRepository.save(ordenCompra);
    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  @Transactional
  public Response<?> update(Integer id, InOrdenesCompras ordenCompra) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    InOrdenesCompras existing =
        inOrdenesComprasRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Orden de compra no encontrada"));

    existing.setSubTotal(ordenCompra.getSubTotal());
    existing.setItbis(ordenCompra.getItbis());
    existing.setTotal(ordenCompra.getTotal());
    existing.setDescuento(ordenCompra.getDescuento());
    existing.setSuplidorId(ordenCompra.getSuplidorId());
    existing.setCotizacionId(ordenCompra.getCotizacionId());

    // Sync detalles
    if (ordenCompra.getDetalles() != null) {
      existing.getDetalles().clear();
      for (InOrdenesComprasDetalles detalle : ordenCompra.getDetalles()) {
        detalle.setOrdenCompraId(existing);
        if (detalle.getEstadoId() == null) {
          detalle.setEstadoId("ACT");
        }
        existing.getDetalles().add(detalle);
      }
    }

    InOrdenesCompras saved = inOrdenesComprasRepository.save(existing);
    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  @Transactional
  public Response<?> disable(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    InOrdenesCompras existing =
        inOrdenesComprasRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Orden de compra no encontrada"));

    existing.setEstadoId("INA");
    // Also disable all detalles
    if (existing.getDetalles() != null) {
      existing.getDetalles().forEach(d -> d.setEstadoId("INA"));
    }

    InOrdenesCompras saved = inOrdenesComprasRepository.save(existing);
    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  public Response<?> getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inOrdenesComprasRepository
        .findByIdAndEmpresaId(id, empresaId)
        .<Response<?>>map(o -> Response.builder().status(HttpStatus.OK).content(o).build())
        .orElseGet(
            () ->
                Response.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .error(new DataNotFoundDTO("Orden de compra no encontrada"))
                    .build());
  }

  @Override
  public Response<?> getByIdDebug(Integer id) {
    // Sin filtro de empresa para debugging
    return inOrdenesComprasRepository
        .findById(id)
        .<Response<?>>map(
            o -> {
              Integer empresaId = tenantContext.getCurrentEmpresaId();
              // Agregar info de debug en el objeto
              System.out.println(
                  String.format(
                      "DEBUG: Orden encontrada. ID=%d, EmpresaId del suplidor=%d, Tu empresaId=%d",
                      o.getId(), o.getSuplidorId().getEmpresaId(), empresaId));
              return Response.builder().status(HttpStatus.OK).content(o).build();
            })
        .orElseGet(
            () ->
                Response.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .error(new DataNotFoundDTO("Orden de compra no encontrada en la base de datos"))
                    .build());
  }

  @Override
  public Response<?> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<InOrdenesCompras> data = inOrdenesComprasRepository.findAllByEmpresaId(empresaId);
    if (data.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("No se encontraron órdenes de compra"))
          .build();
    }
    return Response.builder().status(HttpStatus.OK).content(data).build();
  }

  @Override
  public Response<?> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<InOrdenesCompras> data = inOrdenesComprasRepository.findAllActiveByEmpresaId(empresaId);
    if (data.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("No se encontraron órdenes de compra activas"))
          .build();
    }
    return Response.builder().status(HttpStatus.OK).content(data).build();
  }

  @Override
  public Response<?> getAllActiveSimple() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<InOrdenesComprasSimpleDTO> data =
        inOrdenesComprasRepository.findAllActiveSimpleByEmpresaId(empresaId);
    if (data.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("No se encontraron órdenes de compra activas"))
          .build();
    }
    return Response.builder().status(HttpStatus.OK).content(data).build();
  }

  @Override
  public Response<?> searchByCriteria(InOrdenesComprasSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Page<InOrdenesComprasResumenDTO> page =
        inOrdenesComprasDao.searchByCriteria(criteria, empresaId);

    if (page.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.NOT_FOUND)
          .error(
              new DataNotFoundDTO(
                  "No se encontraron órdenes de compra con los criterios especificados"))
          .build();
    }

    // Retornar el resumen directamente (ya viene optimizado desde el DAO con projection)
    return Response.builder().status(HttpStatus.OK).content(page).build();
  }

  @Override
  @Transactional
  public Response<?> convertirAOrdenEntrada(Integer ordenCompraId, Integer almacenId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    // Buscar orden de compra
    InOrdenesCompras ordenCompra =
        inOrdenesComprasRepository
            .findByIdAndEmpresaId(ordenCompraId, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Orden de compra no encontrada"));

    // Validar que esté en estado PEN
    if (!"PEN".equals(ordenCompra.getEstadoId())) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(
              new DataNotFoundDTO(
                  "Solo se pueden convertir órdenes de compra en estado Pendiente (PEN)"))
          .build();
    }

    // Crear orden de entrada (sin guardar)
    InOrdenEntrada ordenEntrada = new InOrdenEntrada();
    ordenEntrada.setMonto(ordenCompra.getSubTotal());
    ordenEntrada.setItbis(ordenCompra.getItbis());
    ordenEntrada.setTotal(ordenCompra.getTotal());
    ordenEntrada.setDescuento(ordenCompra.getDescuento());
    ordenEntrada.setAlmacenId(almacenId);
    ordenEntrada.setEmpresaId(ordenCompra.getEmpresaId());
    ordenEntrada.setSucursalId(ordenCompra.getSucursalId());
    ordenEntrada.setUsuarioReg(username);

    // Convertir detalles
    List<InOrdenEntradaDetalle> detallesEntrada = new ArrayList<>();
    for (InOrdenesComprasDetalles detalleCompra : ordenCompra.getDetalles()) {
      InOrdenEntradaDetalle detalleEntrada = getInOrdenEntradaDetalle(detalleCompra, ordenCompra, ordenEntrada);

      detallesEntrada.add(detalleEntrada);
    }
    ordenEntrada.setInOrdenDetalleList(detallesEntrada);

    // Retornar la orden de entrada convertida (sin guardar)
    return Response.builder().status(HttpStatus.OK).content(ordenEntrada).build();
  }

  @Nonnull
  private static InOrdenEntradaDetalle getInOrdenEntradaDetalle(InOrdenesComprasDetalles detalleCompra, InOrdenesCompras ordenCompra, InOrdenEntrada ordenEntrada) {
    InOrdenEntradaDetalle detalleEntrada = new InOrdenEntradaDetalle();
    detalleEntrada.setCantidad(detalleCompra.getCantidad());
    detalleEntrada.setPrecioUnitario(detalleCompra.getPrecioUnitario());
    detalleEntrada.setSubTotal(detalleCompra.getSubTotal());
    detalleEntrada.setItbis(detalleCompra.getItbis());
    detalleEntrada.setTotal(detalleCompra.getTotal());
    detalleEntrada.setDescuentoPorciento(detalleCompra.getDescuentoPorciento());
    detalleEntrada.setProductoId(detalleCompra.getProductoId());
    detalleEntrada.setUnidadNombre(detalleCompra.getUnidadNombre());
    detalleEntrada.setUnidadCantidad(detalleCompra.getUnidadCantidad());
    detalleEntrada.setSuplidorId(ordenCompra.getSuplidorId());
    detalleEntrada.setOrdenEntradaId(ordenEntrada);
    return detalleEntrada;
  }
}
