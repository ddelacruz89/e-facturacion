package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgUsuarioDao;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.interfaces.IBaseString;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.models.Response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioServices implements IBaseString<SgUsuario> {
  private final SgUsuarioDao dao;
  private final PasswordEncoder passwordEncoder;

  @Override
  public Response<SgUsuario> getFindById(String id) {
    Optional<SgUsuario> oUsername = dao.findById(id);
    if (oUsername.isEmpty()) {
      return Response.<SgUsuario>builder()
          .status(HttpStatus.OK)
          .error(new DataNotFoundDTO("Usuario no encontrado"))
          .build();
    } else {
      return Response.<SgUsuario>builder().status(HttpStatus.OK).content(oUsername.get()).build();
    }
  }

  @Override
  public Response<List<SgUsuario>> getFindByAll() {
    List<SgUsuario> usuarios = dao.findAll();
    if (usuarios.isEmpty()) {
      return Response.<List<SgUsuario>>builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("Usuarios no encontrados"))
          .build();
    } else {
      return Response.<List<SgUsuario>>builder().status(HttpStatus.OK).content(usuarios).build();
    }
  }

  // Method to find users by empresa ID (for when needed)
  public Response<List<SgUsuario>> getFindByEmpresaId(Integer empresaId) {
    List<SgUsuario> usuarios = dao.findAllByEmpresaId(empresaId);
    if (usuarios.isEmpty()) {
      return Response.<List<SgUsuario>>builder()
          .status(HttpStatus.BAD_REQUEST)
          .error(new DataNotFoundDTO("Usuarios no encontrados para esta empresa"))
          .build();
    } else {
      return Response.<List<SgUsuario>>builder().status(HttpStatus.OK).content(usuarios).build();
    }
  }

  // Method to find user by username and empresa ID (for authentication)
  public Response<SgUsuario> getFindByUsername(Integer empresaId, String username) {
    Optional<SgUsuario> oUsername = dao.findByUsername(empresaId, username);
    if (oUsername.isEmpty()) {
      return Response.<SgUsuario>builder()
          .status(HttpStatus.OK)
          .error(new DataNotFoundDTO("Usuario no encontrado"))
          .build();
    } else {
      return Response.<SgUsuario>builder().status(HttpStatus.OK).content(oUsername.get()).build();
    }
  }

  @Override
  public Response<SgUsuario> save(SgUsuario entity) {
    if (entity.getCambioPassword()) {

      String encode = passwordEncoder.encode(entity.getPassword());
      entity.setPassword(encode);
    }

    entity.setFechaReg(LocalDateTime.now());
    entity.setEstadoId("ACT");
    entity.setUsuarioReg("TEST");
    entity = dao.save(entity);
    return Response.<SgUsuario>builder().status(HttpStatus.OK).content(entity).build();
  }
}
