package com.braintech.eFacturador.services.general;

import com.braintech.eFacturador.dao.facturacion.MgRetencionDao;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.jpa.general.MgRetencion;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RetencionService implements ITipoRetenciones {
  final MgRetencionDao mgRetencionDao;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;

  @Override
  public Response<List<MgRetencion>> getAllActive() {
    List<MgRetencion> retenciones = mgRetencionDao.findAll();

    if (retenciones.isEmpty()) {
      return Response.<List<MgRetencion>>builder()
          .status(HttpStatus.NOT_FOUND)
          .content(List.of())
          .error(new DataNotFoundDTO("No se encontraron retenciones activas"))
          .build();
    }
    return Response.<List<MgRetencion>>builder().status(HttpStatus.OK).content(retenciones).build();
  }

  @Override
  public Response<MgRetencion> createRetencion(MgRetencion retencion) {
    MgRetencion save = mgRetencionDao.save(retencion);
    return Response.<MgRetencion>builder().status(HttpStatus.OK).content(save).build();
  }
}
