package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.producto.MgCategoriaRepository;
import com.braintech.eFacturador.dto.producto.MgCategoriaSimpleDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgCategoria;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class MgCategoriaServiceImpl implements MgCategoriaService {

  private final MgCategoriaRepository mgCategoriaRepository;
  private final TenantContext tenantContext;
  private final SecuenciasDao secuenciasDao;

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
  @Transactional
  public MgCategoria create(MgCategoria mgCategoria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();
    String applicationId = MgCategoria.class.getSimpleName().toUpperCase(Locale.ROOT);

    mgCategoria.setEmpresaId(empresaId);
    mgCategoria.setUsuarioReg(username);
    mgCategoria.setFechaReg(LocalDateTime.now());
    if (mgCategoria.getSecuencia() == null || mgCategoria.getSecuencia().isEmpty()) {
      mgCategoria.setSecuencia(
          String.valueOf(secuenciasDao.getNextSecuencia(empresaId, applicationId)));
    }
    return mgCategoriaRepository.save(mgCategoria);
  }

  @Override
  @Transactional
  public MgCategoria update(Integer id, MgCategoria mgCategoria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    MgCategoria existing =
        mgCategoriaRepository
            .findByIdAndEmpresaId(String.valueOf(id), empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));

    // Update only allowed fields
    existing.setCategoria(mgCategoria.getCategoria());
    existing.setModificable(mgCategoria.getModificable());
    existing.setTieneModulo(mgCategoria.getTieneModulo());
    existing.setActivo(mgCategoria.getActivo());
    // Add other updatable fields as needed

    return mgCategoriaRepository.save(existing);
  }

  @Override
  public void delete(Integer id) {

    mgCategoriaRepository.deleteById(id);
  }

  @Override
  public List<MgCategoriaSimpleDTO> getAllSimple() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return mgCategoriaRepository.findAllSimpleByEmpresaId(empresaId);
  }
}
