package com.braintech.eFacturador.services.facturacion.impl;

import com.braintech.eFacturador.dao.facturacion.MgRetencionItbisRepository;
import com.braintech.eFacturador.dto.facturacion.MgRetencionItbisRequestDTO;
import com.braintech.eFacturador.dto.facturacion.MgRetencionItbisResumenDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.contabilidad.McCatalogoCuenta;
import com.braintech.eFacturador.jpa.general.MgRetencionItbis;
import com.braintech.eFacturador.services.facturacion.MgRetencionItbisService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MgRetencionItbisServiceImpl implements MgRetencionItbisService {

  private final MgRetencionItbisRepository repository;

  @Override
  public List<MgRetencionItbisResumenDTO> findAll() {
    return repository.findAllResumen();
  }

  @Override
  public List<MgRetencionItbisResumenDTO> findByTipo(String tipoRetencion) {
    return repository.findByTipoRetencion(tipoRetencion);
  }

  @Override
  public MgRetencionItbis findById(Integer id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new RecordNotFoundException("Retención ITBIS no encontrada: " + id));
  }

  @Override
  @Transactional
  public MgRetencionItbis save(MgRetencionItbisRequestDTO dto) {
    MgRetencionItbis entity = new MgRetencionItbis();
    mapDtoToEntity(dto, entity);
    return repository.save(entity);
  }

  @Override
  @Transactional
  public MgRetencionItbis update(Integer id, MgRetencionItbisRequestDTO dto) {
    MgRetencionItbis entity = findById(id);
    mapDtoToEntity(dto, entity);
    return repository.save(entity);
  }

  @Override
  @Transactional
  public void delete(Integer id) {
    MgRetencionItbis entity = findById(id);
    repository.delete(entity);
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private void mapDtoToEntity(MgRetencionItbisRequestDTO dto, MgRetencionItbis entity) {
    entity.setDescripcion(dto.getDescripcion());
    entity.setValor(dto.getValor());
    entity.setComentarioFactura(dto.getComentarioFactura());
    entity.setAlTotal(dto.getAlTotal() != null ? dto.getAlTotal() : false);
    entity.setTipoRetencion(dto.getTipoRetencion() != null ? dto.getTipoRetencion() : "ITBIS");

    // Cuentas contables — solo se asigna la referencia por ID (sin consulta extra innecesaria)
    if (dto.getRetenerCuentaId() != null) {
      McCatalogoCuenta retener = new McCatalogoCuenta();
      retener.setId(dto.getRetenerCuentaId());
      entity.setRetenerCuenta(retener);
    } else {
      entity.setRetenerCuenta(null);
    }

    if (dto.getRetenidoCuentaId() != null) {
      McCatalogoCuenta retenido = new McCatalogoCuenta();
      retenido.setId(dto.getRetenidoCuentaId());
      entity.setRetenidoCuenta(retenido);
    } else {
      entity.setRetenidoCuenta(null);
    }
  }
}
