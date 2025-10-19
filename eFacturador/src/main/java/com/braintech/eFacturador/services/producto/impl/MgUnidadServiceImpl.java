package com.braintech.eFacturador.services.producto.impl;

import com.braintech.eFacturador.dao.producto.MgUnidadRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgUnidad;
import com.braintech.eFacturador.services.producto.MgUnidadService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MgUnidadServiceImpl implements MgUnidadService {

  @Autowired private MgUnidadRepository unidadRepository;

  @Autowired private TenantContext tenantContext;

  @Override
  public List<MgUnidad> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return unidadRepository.findAllByEmpresaId(empresaId);
  }

  @Override
  public List<MgUnidad> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return unidadRepository.findAllActiveByEmpresaId(empresaId);
  }

  @Override
  public MgUnidad getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return unidadRepository
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }

  @Override
  @Transactional
  public MgUnidad create(MgUnidad unidad) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    unidad.setEmpresaId(empresaId);
    unidad.setUsuarioReg(username);
    unidad.setFechaReg(LocalDateTime.now());
    unidad.setActivo(true);

    return unidadRepository.save(unidad);
  }

  @Override
  @Transactional
  public MgUnidad update(Integer id, MgUnidad unidad) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    MgUnidad existing =
        unidadRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Update fields
    unidad.setId(id);
    unidad.setEmpresaId(empresaId);
    unidad.setUsuarioReg(existing.getUsuarioReg());
    unidad.setFechaReg(existing.getFechaReg());

    return unidadRepository.save(unidad);
  }

  @Override
  @Transactional
  public void delete(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    MgUnidad existing =
        unidadRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Soft delete - set activo to false
    existing.setActivo(false);
    unidadRepository.save(existing);
  }
}
