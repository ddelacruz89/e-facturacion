package com.braintech.eFacturador.services.seguridad.impl;

import com.braintech.eFacturador.dao.seguridad.SgMenuRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.seguridad.SgMenu;
import com.braintech.eFacturador.services.seguridad.SgMenuService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SgMenuServiceImpl implements SgMenuService {

  @Autowired private SgMenuRepository menuRepository;

  @Autowired private TenantContext tenantContext;

  @Override
  public List<SgMenu> getAllActive() {
    return menuRepository.findAllActive();
  }

  @Override
  public List<SgMenu> getAll() {
    return menuRepository.findAll();
  }

  @Override
  public SgMenu getById(Integer id) {
    return menuRepository
        .findById(id)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }

  @Override
  public List<SgMenu> getByModuloId(String moduloId) {
    return menuRepository.findByModuloIdAndActive(moduloId);
  }

  @Override
  public List<SgMenu> getByTipoMenuId(Integer tipoMenuId) {
    return menuRepository.findByTipoMenuIdAndActive(tipoMenuId);
  }

  @Override
  @Transactional
  public SgMenu create(SgMenu menu) {
    String username = tenantContext.getCurrentUsername();

    menu.setUsuarioReg(username);
    menu.setFechaReg(LocalDateTime.now());
    menu.setActivo(true);

    return menuRepository.save(menu);
  }

  @Override
  @Transactional
  public void delete(Integer id) {
    SgMenu menu =
        menuRepository
            .findById(id)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Soft delete - set activo to false
    menu.setActivo(false);
    menuRepository.save(menu);
  }
}
