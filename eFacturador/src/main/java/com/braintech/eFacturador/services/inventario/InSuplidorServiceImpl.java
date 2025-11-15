package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.inventario.InSuplidorRepository;
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
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class InSuplidorServiceImpl implements InSuplidorService {

  private final InSuplidorRepository inSuplidorRepository;
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
}
