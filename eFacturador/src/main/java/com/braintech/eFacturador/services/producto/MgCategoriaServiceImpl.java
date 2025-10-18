package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.dao.producto.MgCategoriaRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgCategoria;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MgCategoriaServiceImpl implements MgCategoriaService {

  @Autowired private MgCategoriaRepository mgCategoriaRepository;

  @Autowired private TenantContext tenantContext;

  @Override
  public List<MgCategoria> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return mgCategoriaRepository.findAllByEmpresaId(empresaId);
  }

  @Override
  public List<MgCategoria> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return mgCategoriaRepository.findAllActiveByEmpresaId(empresaId);
  }

  @Override
  public MgCategoria getById(String id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return mgCategoriaRepository
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
  }

  @Override
  public MgCategoria create(MgCategoria mgCategoria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    mgCategoria.setEmpresaId(empresaId);
    mgCategoria.setUsuarioReg(username);
    mgCategoria.setFechaReg(LocalDateTime.now());

    return mgCategoriaRepository.save(mgCategoria);
  }

  @Override
  public MgCategoria update(String id, MgCategoria mgCategoria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    mgCategoria.setId(id);
    mgCategoria.setEmpresaId(empresaId);
    return mgCategoriaRepository.save(mgCategoria);
  }

  @Override
  public void delete(String id) {

    mgCategoriaRepository.deleteById(id);
  }
}
