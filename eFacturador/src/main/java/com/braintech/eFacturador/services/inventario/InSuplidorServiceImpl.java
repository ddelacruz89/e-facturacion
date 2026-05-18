package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.inventario.InSuplidorRepository;
import com.braintech.eFacturador.dao.producto.MgProductoSuplidorRepository;
import com.braintech.eFacturador.dto.inventario.InSuplidorProductoRequestDTO;
import com.braintech.eFacturador.dto.inventario.InSuplidorProductoResumenDTO;
import com.braintech.eFacturador.dto.inventario.InSuplidorProductoView;
import com.braintech.eFacturador.dto.inventario.InSuplidorResumenDTO;
import com.braintech.eFacturador.dto.inventario.InSuplidorSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InSuplidorSimpleDTO;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InSuplidorService;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class InSuplidorServiceImpl implements InSuplidorService {

  private final InSuplidorRepository inSuplidorRepository;
  private final MgProductoSuplidorRepository mgProductoSuplidorRepository;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;

  @Override
  @Transactional
  public Response<?> create(InSuplidor suplidor) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();
    String applicationId = InSuplidor.class.getSimpleName().toUpperCase(Locale.ROOT);

    suplidor.setEmpresaId(empresaId);
    suplidor.setUsuarioReg(username);
    suplidor.setFechaReg(LocalDateTime.now());
    suplidor.setActivo(true);
    if (suplidor.getSecuencia() == null) { // respect provided sequence per rules
      suplidor.setSecuencia(secuenciasDao.getNextSecuencia(empresaId, applicationId));
    }

    InSuplidor saved = inSuplidorRepository.save(suplidor);
    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  @Transactional
  public Response<?> update(Integer id, InSuplidor suplidor) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    InSuplidor existing =
        inSuplidorRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Suplidor no encontrado"));

    // Update allowed fields (do not modify empresaId, usuarioReg, fechaReg, secuencia)
    existing.setNombre(suplidor.getNombre());
    existing.setRnc(suplidor.getRnc());
    existing.setDireccion(suplidor.getDireccion());
    existing.setContacto1(suplidor.getContacto1());
    existing.setContacto2(suplidor.getContacto2());
    existing.setTelefono1(suplidor.getTelefono1());
    existing.setTelefono2(suplidor.getTelefono2());
    existing.setCorreo1(suplidor.getCorreo1());
    existing.setCorreo2(suplidor.getCorreo2());
    existing.setServicio(suplidor.getServicio());
    existing.setProducto(suplidor.getProducto());
    existing.setTipoIdentificacion(suplidor.getTipoIdentificacion());
    existing.setTipoComprobante(suplidor.getTipoComprobante());

    InSuplidor saved = inSuplidorRepository.save(existing);
    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  @Transactional
  public Response<?> disable(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    InSuplidor existing =
        inSuplidorRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Suplidor no encontrado"));
    existing.setActivo(false);
    InSuplidor saved = inSuplidorRepository.save(existing);
    return Response.builder().status(HttpStatus.OK).content(saved).build();
  }

  @Override
  public Response<?> getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inSuplidorRepository
        .findByIdAndEmpresaId(id, empresaId)
        .<Response<?>>map(s -> Response.builder().status(HttpStatus.OK).content(s).build())
        .orElseGet(
            () ->
                Response.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .error(new DataNotFoundDTO("Suplidor no encontrado"))
                    .build());
  }

  @Override
  public Response<?> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<InSuplidor> data = inSuplidorRepository.findAllByEmpresaId(empresaId);
    if (data.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("No se encontraron suplidores"))
          .build();
    }
    return Response.builder().status(HttpStatus.OK).content(data).build();
  }

  @Override
  public Response<?> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<InSuplidor> data = inSuplidorRepository.findAllActiveByEmpresaId(empresaId);
    if (data.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("No se encontraron suplidores activos"))
          .build();
    }
    return Response.builder().status(HttpStatus.OK).content(data).build();
  }

  @Override
  public Response<?> getByRnc(String rnc) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inSuplidorRepository
        .findByRncAndEmpresaId(rnc, empresaId)
        .<Response<?>>map(s -> Response.builder().status(HttpStatus.OK).content(s).build())
        .orElseGet(
            () ->
                Response.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .error(new DataNotFoundDTO("Suplidor no encontrado"))
                    .build());
  }

  @Override
  public InSuplidor findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inSuplidorRepository.findByIdAndEmpresaId(id, empresaId).orElse(null);
  }

  @Override
  public List<InSuplidor> findAllByEmpresa() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inSuplidorRepository.findAllByEmpresaId(empresaId);
  }

  @Override
  public Response<?> getAllActiveSimple() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<InSuplidorSimpleDTO> data = inSuplidorRepository.findAllActiveSimpleByEmpresaId(empresaId);
    if (data.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("No se encontraron suplidores activos"))
          .build();
    }
    return Response.builder().status(HttpStatus.OK).content(data).build();
  }

  // -------------------------------------------------------------------------
  // Búsqueda paginada
  // -------------------------------------------------------------------------

  @Override
  public Response<?> buscar(InSuplidorSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    int page = criteria.getPage() != null ? criteria.getPage() : 0;
    int size = criteria.getSize() != null ? criteria.getSize() : 10;
    Pageable pageable = PageRequest.of(page, size);

    // NUNCA pasar null — PostgreSQL+Hibernate 6 bindea null como bytea y falla en LOWER().
    // Usar "" y el JPQL compara con :param = '' para ignorar el filtro.
    String nombre =
        (criteria.getNombre() == null || criteria.getNombre().isBlank())
            ? ""
            : criteria.getNombre().trim();
    String rnc =
        (criteria.getRnc() == null || criteria.getRnc().isBlank()) ? "" : criteria.getRnc().trim();
    String tipoComprobanteId =
        (criteria.getTipoComprobanteId() == null || criteria.getTipoComprobanteId().isBlank())
            ? ""
            : criteria.getTipoComprobanteId().trim();

    Page<InSuplidorResumenDTO> resultado =
        inSuplidorRepository.buscar(empresaId, nombre, rnc, tipoComprobanteId, pageable);

    return Response.builder().status(HttpStatus.OK).content(resultado).build();
  }

  // -------------------------------------------------------------------------
  // Gestión de productos del suplidor
  // -------------------------------------------------------------------------

  @Override
  public Response<?> getProductos(Integer suplidorId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    // Verificar que el suplidor pertenece a esta empresa
    inSuplidorRepository
        .findByIdAndEmpresaId(suplidorId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Suplidor no encontrado"));

    List<InSuplidorProductoView> views =
        mgProductoSuplidorRepository.findProductosBySuplidor(suplidorId, empresaId);

    List<InSuplidorProductoResumenDTO> dtos =
        views.stream()
            .map(
                v ->
                    new InSuplidorProductoResumenDTO(
                        v.getId(),
                        v.getProductoId(),
                        v.getProductoNombre(),
                        v.getPrecio(),
                        v.getEstadoId()))
            .collect(Collectors.toList());

    return Response.builder().status(HttpStatus.OK).content(dtos).build();
  }

  @Override
  @Transactional
  public Response<?> addProducto(Integer suplidorId, InSuplidorProductoRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    inSuplidorRepository
        .findByIdAndEmpresaId(suplidorId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Suplidor no encontrado"));

    // Verificar duplicado
    if (mgProductoSuplidorRepository.existeProductoEnSuplidor(
        suplidorId, empresaId, request.getProductoId())) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("El producto ya está asociado a este suplidor"))
          .build();
    }

    int rows =
        mgProductoSuplidorRepository.addProductoToSuplidor(
            empresaId, suplidorId, request.getProductoId(), request.getPrecio(), username);

    if (rows == 0) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(
              new DataNotFoundDTO(
                  "No se encontró configuración de unidad para el producto. Configure el producto antes de asignarlo al suplidor."))
          .build();
    }

    return Response.builder()
        .status(HttpStatus.OK)
        .content("Producto agregado exitosamente")
        .build();
  }

  @Override
  @Transactional
  public Response<?> updateProductoPrecio(
      Integer suplidorId, Integer id, InSuplidorProductoRequestDTO request) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    inSuplidorRepository
        .findByIdAndEmpresaId(suplidorId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Suplidor no encontrado"));

    int rows =
        mgProductoSuplidorRepository.updatePrecio(id, request.getPrecio(), empresaId, suplidorId);

    if (rows == 0) {
      return Response.builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("Relación producto-suplidor no encontrada"))
          .build();
    }

    return Response.builder()
        .status(HttpStatus.OK)
        .content("Precio actualizado exitosamente")
        .build();
  }

  @Override
  @Transactional
  public Response<?> removeProducto(Integer suplidorId, Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    inSuplidorRepository
        .findByIdAndEmpresaId(suplidorId, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Suplidor no encontrado"));

    int rows = mgProductoSuplidorRepository.removeProducto(id, empresaId, suplidorId);

    if (rows == 0) {
      return Response.builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("Relación producto-suplidor no encontrada"))
          .build();
    }

    return Response.builder()
        .status(HttpStatus.OK)
        .content("Producto eliminado exitosamente")
        .build();
  }
}
