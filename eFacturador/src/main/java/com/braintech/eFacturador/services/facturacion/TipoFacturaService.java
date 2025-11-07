package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.TipoFacturaDao;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.jpa.facturacion.MgTipoFactura;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipoFacturaService implements ITipoEntity<MgTipoFactura> {
  private final TipoFacturaDao tipoFacturaDao;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;

  @Override
  public Response<List<MgTipoFactura>> findAll() {
    List<MgTipoFactura> tipos = tipoFacturaDao.findAll();
    if (tipos.isEmpty()) {
      return Response.<List<MgTipoFactura>>builder()
          .status(HttpStatus.NOT_FOUND)
          .content(List.of())
          .error(new DataNotFoundDTO("Tipo Factura no tiene registro"))
          .build();
    }
    return Response.<List<MgTipoFactura>>builder().status(HttpStatus.OK).content(tipos).build();
  }

  @Override
  @Transactional
  public Response<MgTipoFactura> save(MgTipoFactura entity) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    // Do not set id manually; let JPA generate it
    entity.setEmpresaId(empresaId);
    String userName = tenantContext.getCurrentUsername();
    entity.setFechaReg(LocalDateTime.now());
    entity.setUsuarioReg(userName);
    MgTipoFactura saved = tipoFacturaDao.save(entity);

    if (entity.getId() > 0 && entity.getSecuencia() == null) {
      String sequenceName = entity.getClass().getSimpleName();
      Integer sequence = secuenciasDao.getNextSecuencia(empresaId, sequenceName);
      saved.setSecuencia(sequence);
      MgTipoFactura updated = tipoFacturaDao.save(saved);
      return Response.<MgTipoFactura>builder().status(HttpStatus.OK).content(updated).build();
    }

    return Response.<MgTipoFactura>builder()
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error(new DataNotFoundDTO("No se pudo guardar Tipo Factura"))
        .build();
  }
}
