package com.braintech.eFacturador.services.facturacion.impl;

import com.braintech.eFacturador.dao.facturacion.MfFacturaSuplidorFormaPagoRepository;
import com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorFormaPagoRequestDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorFormaPago;
import com.braintech.eFacturador.services.facturacion.MfFacturaSuplidorFormaPagoService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MfFacturaSuplidorFormaPagoServiceImpl implements MfFacturaSuplidorFormaPagoService {

  private final MfFacturaSuplidorFormaPagoRepository repository;
  private final TenantContext tenantContext;

  @Override
  public List<MfFacturaSuplidorFormaPago> findAll() {
    return repository.findAll();
  }

  @Override
  public List<MfFacturaSuplidorFormaPago> findActivos() {
    return repository.findByEstadoId("ACT");
  }

  @Override
  public MfFacturaSuplidorFormaPago findById(Integer id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new RecordNotFoundException("Forma de pago no encontrada: " + id));
  }

  @Override
  @Transactional
  public MfFacturaSuplidorFormaPago save(MfFacturaSuplidorFormaPagoRequestDTO dto) {
    MfFacturaSuplidorFormaPago entity = new MfFacturaSuplidorFormaPago();
    mapFields(dto, entity);
    entity.setFechaReg(LocalDateTime.now());
    entity.setUsuarioReg(tenantContext.getCurrentUsername());
    return repository.save(entity);
  }

  @Override
  @Transactional
  public MfFacturaSuplidorFormaPago update(Integer id, MfFacturaSuplidorFormaPagoRequestDTO dto) {
    MfFacturaSuplidorFormaPago entity = findById(id);
    mapFields(dto, entity);
    return repository.save(entity);
  }

  private void mapFields(MfFacturaSuplidorFormaPagoRequestDTO dto, MfFacturaSuplidorFormaPago e) {
    e.setFormaPago(dto.getFormaPago());
    e.setEstadoId(dto.getEstadoId() != null ? dto.getEstadoId() : "ACT");
    e.setTipoFormaPago(dto.getTipoFormaPago());
  }
}
