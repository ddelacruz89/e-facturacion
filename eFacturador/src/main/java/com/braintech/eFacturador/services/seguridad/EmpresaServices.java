package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.EmpresaDao;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.interfaces.IEmpresa;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresa;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmpresaServices implements IEmpresa {
  private EmpresaDao dao;
  private final TenantContext tenantContext;

  @Override
  public Response<SgEmpresa> getFindById(Integer id) {
    Optional<SgEmpresa> oEmpresa = dao.findById(id);

    if (oEmpresa.isEmpty()) {
      return Response.<SgEmpresa>builder()
          .status(HttpStatus.OK)
          .error(new DataNotFoundDTO("Empresa no encontrada"))
          .build();
    } else {
      return Response.<SgEmpresa>builder().status(HttpStatus.OK).content(oEmpresa.get()).build();
    }
  }

  @Override
  public Response<SgEmpresa> getCurrent() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return this.getFindById(empresaId);
  }

  @Override
  public Response<?> getFindByAll() {
    List<SgEmpresa> empresaList = dao.findAll();
    if (empresaList.isEmpty()) {
      return Response.builder()
          .status(HttpStatus.OK)
          .error(new DataNotFoundDTO("No Existe Empresas"))
          .build();
    } else {
      return Response.builder().status(HttpStatus.OK).content(empresaList).build();
    }
  }

  @Override
  public Response<SgEmpresa> save(SgEmpresa entity) {
    SgEmpresa save = dao.save(entity);

    return Response.<SgEmpresa>builder().status(HttpStatus.OK).content(save).build();
  }
}
