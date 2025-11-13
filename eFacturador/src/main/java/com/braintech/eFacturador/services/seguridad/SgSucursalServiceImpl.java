package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.interfaces.seguridad.SgSucursalService;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.models.Response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class SgSucursalServiceImpl implements SgSucursalService {
  @Autowired private SgSucursalRepository sucursalRepository;

  private SgSucursal updateSucursal(Integer id, SgSucursal sucursal) {
    Optional<SgSucursal> opt = sucursalRepository.findById(id);
    if (opt.isPresent()) {
      SgSucursal existing = opt.get();
      existing.setNombre(sucursal.getNombre());
      existing.setEncargado(sucursal.getEncargado());
      existing.setDireccion(sucursal.getDireccion());
      existing.setEmail(sucursal.getEmail());
      existing.setEmpresa(sucursal.getEmpresa());
      return sucursalRepository.save(existing);
    }
    throw new RuntimeException("Sucursal no encontrada");
  }

  @Override
  public SgSucursal findById(Integer id) {
    return sucursalRepository.findById(id).orElse(null);
  }

  @Override
  public List<SgSucursal> findAll() {
    return sucursalRepository.findAll();
  }

  // Response-based methods that the controller expects
  @Override
  public Response<?> getFindByAll() {
    List<SgSucursal> sucursales = sucursalRepository.findAll();
    if (sucursales.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("No se encontraron sucursales"))
          .build();
    } else {
      return Response.builder().status(HttpStatus.OK).content(sucursales).build();
    }
  }

  @Override
  public Response<?> getFindAllActive() {
    List<SgSucursal> sucursales = sucursalRepository.findAllActive();
    if (sucursales.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("No se encontraron sucursales activas"))
          .build();
    } else {
      return Response.builder().status(HttpStatus.OK).content(sucursales).build();
    }
  }

  @Override
  public Response<?> getFindById(Integer id) {
    Optional<SgSucursal> oSucursal = sucursalRepository.findById(id);
    if (oSucursal.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("Sucursal no encontrada"))
          .build();
    } else {
      return Response.builder().status(HttpStatus.OK).content(oSucursal.get()).build();
    }
  }

  @Override
  public Response<?> save(SgSucursal sucursal) {
    try {
      if (sucursal.getId() == null) {
        // New sucursal
        sucursal.setFechaReg(LocalDateTime.now());
        sucursal.setUsuarioReg("SYSTEM"); // You can get this from security context
        sucursal.setEstadoId("ACT");
      }
      SgSucursal savedSucursal = sucursalRepository.save(sucursal);
      return Response.builder().status(HttpStatus.OK).content(savedSucursal).build();
    } catch (Exception e) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("Error al guardar la sucursal: " + e.getMessage()))
          .build();
    }
  }

  @Override
  public Response<?> update(Integer id, SgSucursal sucursal) {
    try {
      sucursal.setId(id);
      SgSucursal updatedSucursal = updateSucursal(id, sucursal);
      return Response.builder().status(HttpStatus.OK).content(updatedSucursal).build();
    } catch (Exception e) {
      return Response.builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("Error al actualizar la sucursal: " + e.getMessage()))
          .build();
    }
  }

  @Override
  public Response<?> disable(Integer id) {
    Optional<SgSucursal> opt = sucursalRepository.findById(id);
    if (opt.isPresent()) {
      SgSucursal sucursal = opt.get();
      sucursal.setEstadoId("INA");
      SgSucursal disabledSucursal = sucursalRepository.save(sucursal);
      return Response.builder().status(HttpStatus.OK).content(disabledSucursal).build();
    } else {
      return Response.builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("Sucursal no encontrada"))
          .build();
    }
  }
}
