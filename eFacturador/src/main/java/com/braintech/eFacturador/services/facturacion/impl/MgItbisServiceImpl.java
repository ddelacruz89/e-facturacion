package com.braintech.eFacturador.services.facturacion.impl;

import com.braintech.eFacturador.dao.facturacion.MgItbisRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.facturacion.MgItbis;
import com.braintech.eFacturador.services.facturacion.MgItbisService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MgItbisServiceImpl implements MgItbisService {

  @Autowired private MgItbisRepository mgItbisRepository;

  @Autowired private TenantContext tenantContext;

  @Override
  public List<MgItbis> getAll() {
    return mgItbisRepository.findAll();
  }

  @Override
  public List<MgItbis> getAllActive() {
    return mgItbisRepository.findAllActive();
  }

  @Override
  public MgItbis getById(Integer id) {
    return mgItbisRepository
        .findById(id)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }

  @Override
  @Transactional
  public MgItbis create(MgItbis entity) {
    String username = tenantContext.getCurrentUsername();

    entity.setUsuarioReg(username);
    entity.setFechaReg(LocalDateTime.now());
    entity.setActivo(true);

    return mgItbisRepository.save(entity);
  }

  @Override
  @Transactional
  public MgItbis update(Integer id, MgItbis entity) {
    MgItbis existing =
        mgItbisRepository
            .findById(id)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Update fields - keep audit fields from existing
    entity.setId(id);
    entity.setUsuarioReg(existing.getUsuarioReg());
    entity.setFechaReg(existing.getFechaReg());

    return mgItbisRepository.save(entity);
  }

  @Override
  @Transactional
  public void delete(Integer id) {
    MgItbis existing =
        mgItbisRepository
            .findById(id)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Soft delete - set activo to false
    existing.setActivo(false);
    mgItbisRepository.save(existing);
  }
}
