package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.dao.facturacion.CotizacionDao;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dto.facturacion.ICotizacionResumen;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.facturacion.MfCotizacion;
import com.braintech.eFacturador.models.PagesResult;
import com.braintech.eFacturador.util.LocalDateZone;
import com.braintech.eFacturador.util.PageableUtils;
import com.braintech.eFacturador.util.TenantContext;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CotizacionServices implements IContizacion {
  private final CotizacionDao cotizacionDao;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;

  @Override
  public List<MfCotizacion> getAllActive() {
    return List.of();
  }

  @Override
  public PagesResult<List<ICotizacionResumen>> getAll(int page, int size) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Pageable pageable = PageRequest.of(page, size);
    Page<ICotizacionResumen> cotizacionResumen =
        cotizacionDao.findAllByEmpresaPage(pageable, empresaId);
    return PageableUtils.getPagesResult(cotizacionResumen);
  }

  @Override
  public MfCotizacion getById(Integer id) {
    return null;
  }

  @Override
  @Transactional
  public MfCotizacion save(MfCotizacion entity) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();
    entity.setId(entity.getId().equals(0) ? null : entity.getId());
    entity.setEmpresaId(empresaId);
    entity.setSucursalId(sucursalId);
    entity.setUsuarioReg(username);
    entity.setFechaReg(LocalDateZone.toLocalDateTime());
    entity.getDetalles().forEach(entityDetalle -> entityDetalle.setCotizacion(entity));
    int nextSecuencia =
        secuenciasDao.getNextSecuencia(
            empresaId, MfCotizacion.class.getSimpleName().toUpperCase(Locale.ROOT));
    entity.setSecuencia(nextSecuencia);
    MfCotizacion save = cotizacionDao.save(entity);
    return save;
  }

  @Override
  public MfCotizacion getByNumeroCotizacion(Integer secuencia) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return cotizacionDao
        .findBySecuenicaAndEmpresaIdAndSucursalId(secuencia, empresaId, sucursalId)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }
}
