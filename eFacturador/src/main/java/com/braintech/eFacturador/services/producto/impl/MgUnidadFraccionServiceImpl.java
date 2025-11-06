package com.braintech.eFacturador.services.producto.impl;

import com.braintech.eFacturador.dao.producto.MgUnidadFraccionRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgUnidadFraccion;
import com.braintech.eFacturador.services.producto.MgUnidadFraccionService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MgUnidadFraccionServiceImpl implements MgUnidadFraccionService {

  @Autowired private MgUnidadFraccionRepository unidadFraccionRepository;

  @Autowired private TenantContext tenantContext;

  @Override
  public List<MgUnidadFraccion> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return unidadFraccionRepository.findAllByEmpresaId(empresaId);
  }

  @Override
  public List<MgUnidadFraccion> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return unidadFraccionRepository.findAllActiveByEmpresaId(empresaId);
  }

  @Override
  public MgUnidadFraccion getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return unidadFraccionRepository
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }

  @Override
  public List<MgUnidadFraccion> getByProductoId(Integer productoId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return unidadFraccionRepository.findByProductoIdAndEmpresaId(productoId, empresaId);
  }

  @Override
  @Transactional
  public MgUnidadFraccion create(MgUnidadFraccion unidadFraccion) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    unidadFraccion.setEmpresaId(empresaId);
    unidadFraccion.setUsuarioReg(username);
    unidadFraccion.setFechaReg(LocalDateTime.now());
    unidadFraccion.setActivo(true);

    return unidadFraccionRepository.save(unidadFraccion);
  }

  @Override
  @Transactional
  public MgUnidadFraccion update(Integer id, MgUnidadFraccion unidadFraccion) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    MgUnidadFraccion existing =
        unidadFraccionRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Update fields
    unidadFraccion.setId(id);
    unidadFraccion.setEmpresaId(empresaId);
    unidadFraccion.setUsuarioReg(existing.getUsuarioReg());
    unidadFraccion.setFechaReg(existing.getFechaReg());

    return unidadFraccionRepository.save(unidadFraccion);
  }

  @Override
  @Transactional
  public void delete(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    MgUnidadFraccion existing =
        unidadFraccionRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Soft delete - set activo to false
    existing.setActivo(false);
    unidadFraccionRepository.save(existing);
  }
}
