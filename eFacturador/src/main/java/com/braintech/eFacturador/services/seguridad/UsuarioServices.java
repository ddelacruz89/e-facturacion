package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgUsuarioDao;
import com.braintech.eFacturador.exceptions.DataNotFondException;
import com.braintech.eFacturador.interfaces.IBaseString;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.models.Response;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UsuarioServices implements IBaseString {
    private SgUsuarioDao dao;
    final Integer empresaId = 2;

    @Override
    public Response<?> getFindById(String id) {
        Optional<SgUsuario> oUsername = dao.findByUsername(empresaId, id);
        if (oUsername.isEmpty()) {
            return Response.builder()
                    .status(HttpStatus.OK)
                    .error(new DataNotFondException("Usuario no encontrada"))
                    .build();
        } else {
            return Response.builder()
                    .status(HttpStatus.OK)
                    .content(oUsername)
                    .build();
        }
    }

    @Override
    public Response<?> getFindByAll() {
        List<SgUsuario> empresas = dao.findAllByEmpresaId(empresaId);
        if (empresas.isEmpty()) {
            return Response.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error(new DataNotFondException("Usuario no encontrada"))
                    .build();
        } else {
            return Response.builder()
                    .status(HttpStatus.OK)
                    .content(empresas)
                    .build();
        }
    }

    @Override
    public <T> Response<?> save(T entity) {
        SgUsuario usuario = entity instanceof SgUsuario ? (SgUsuario) entity : new SgUsuario();
        usuario.setFechaReg(LocalDateTime.now());
        usuario.setActivo(true);
        usuario.setUsuarioReg("TEST");

        usuario = dao.save(usuario);
        return Response.builder()
                .status(HttpStatus.OK)
                .content(usuario)
                .build();
    }
}
