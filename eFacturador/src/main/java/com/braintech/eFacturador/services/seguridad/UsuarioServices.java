package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgUsuarioDao;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.interfaces.IBaseString;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.models.Response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UsuarioServices implements IBaseString {
  private SgUsuarioDao dao;

  @Override
  public Response<?> getFindById(String id) {
    Optional<SgUsuario> oUsername = dao.findById(id);
    if (oUsername.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.OK)
          .error(new DataNotFoundDTO("Usuario no encontrado"))
          .build();
    } else {
      return Response.builder().status(HttpStatus.OK).content(oUsername.get()).build();
    }
  }

  @Override
  public Response<?> getFindByAll() {
    List<SgUsuario> usuarios = dao.findAll();
    if (usuarios.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("Usuarios no encontrados"))
          .build();
    } else {
      return Response.builder().status(HttpStatus.OK).content(usuarios).build();
    }
  }

  // Method to find users by empresa ID (for when needed)
  public Response<?> getFindByEmpresaId(Integer empresaId) {
    List<SgUsuario> usuarios = dao.findAllByEmpresaId(empresaId);
    if (usuarios.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("Usuarios no encontrados para esta empresa"))
          .build();
    } else {
      return Response.builder().status(HttpStatus.OK).content(usuarios).build();
    }
  }

  // Method to find user by username and empresa ID (for authentication)
  public Response<?> getFindByUsername(Integer empresaId, String username) {
    Optional<SgUsuario> oUsername = dao.findByUsername(empresaId, username);
    if (oUsername.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.OK)
          .error(new DataNotFoundDTO("Usuario no encontrado"))
          .build();
    } else {
      return Response.builder().status(HttpStatus.OK).content(oUsername.get()).build();
    }
  }

  @Override
  public Response<?> save(Object entity) {
    SgUsuario usuario = entity instanceof SgUsuario ? (SgUsuario) entity : new SgUsuario();
    usuario.setFechaReg(LocalDateTime.now());
    usuario.setEstadoId("ACT");
    usuario.setUsuarioReg("TEST");

    usuario = dao.save(usuario);
    return Response.builder().status(HttpStatus.OK).content(usuario).build();
  }
}
