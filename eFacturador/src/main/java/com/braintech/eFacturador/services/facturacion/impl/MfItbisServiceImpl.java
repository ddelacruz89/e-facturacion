package com.braintech.eFacturador.services.facturacion.impl;

import com.braintech.eFacturador.dao.facturacion.MfItbisRepository;
import com.braintech.eFacturador.dao.facturacion.MgItbisRepository;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dto.facturacion.MfItbisRequestDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.facturacion.MfItbis;
import com.braintech.eFacturador.jpa.general.MgItbis;
import com.braintech.eFacturador.services.facturacion.MfItbisService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MfItbisServiceImpl implements MfItbisService {

  private final MfItbisRepository repository;
  private final MgItbisRepository mgItbisRepository;
  private final SecuenciasDao secuenciasDao;
  private final TenantContext tenantContext;

  @Override
  public List<MfItbis> findAll() {
    return repository.findByEmpresaId(tenantContext.getCurrentEmpresaId());
  }

  @Override
  public MfItbis findById(Integer id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new RecordNotFoundException("ITBIS no encontrado: " + id));
  }

  @Override
  @Transactional
  public MfItbis save(MfItbisRequestDTO dto) {
    MfItbis entity = new MfItbis();
    entity.setEmpresaId(tenantContext.getCurrentEmpresaId());
    entity.setFechaReg(LocalDateTime.now());
    entity.setUsuarioReg(tenantContext.getCurrentUsername());
    mapFields(dto, entity);

    MfItbis saved = repository.save(entity);
    int seq =
        secuenciasDao.getNextSecuencia(
            saved.getEmpresaId(), MfItbis.class.getSimpleName().toUpperCase(Locale.ROOT));
    saved.setSecuencia(seq);
    return repository.save(saved);
  }

  @Override
  @Transactional
  public MfItbis update(Integer id, MfItbisRequestDTO dto) {
    MfItbis entity = findById(id);
    mapFields(dto, entity);
    return repository.save(entity);
  }

  private void mapFields(MfItbisRequestDTO dto, MfItbis entity) {
    entity.setNombre(dto.getNombre());
    entity.setItbis(dto.getItbis());
    entity.setCuentaContable(dto.getCuentaContable());
    MgItbis mgItbis =
        mgItbisRepository
            .findById(dto.getMgItbisId())
            .orElseThrow(
                () -> new RecordNotFoundException("MgItbis no encontrado: " + dto.getMgItbisId()));
    entity.setMgItbis(mgItbis);
  }
}
