package com.braintech.eFacturador.services.despacho;

import com.braintech.eFacturador.dao.despacho.DeTipoVehiculoRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.despacho.DeTipoVehiculoService;
import com.braintech.eFacturador.jpa.despacho.DeTipoVehiculo;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class DeTipoVehiculoServiceImpl implements DeTipoVehiculoService {

  private final DeTipoVehiculoRepository repository;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public DeTipoVehiculo save(DeTipoVehiculo tipo) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    tipo.setEmpresaId(empresaId);
    if (tipo.getActivo() == null) tipo.setActivo(true);
    if (tipo.getFechaReg() == null) tipo.setFechaReg(LocalDateTime.now());
    if (tipo.getUsuarioReg() == null) tipo.setUsuarioReg(tenantContext.getCurrentUsername());
    return repository.save(tipo);
  }

  @Override
  public DeTipoVehiculo findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return repository
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Tipo de vehículo no encontrado: " + id));
  }

  @Override
  public List<DeTipoVehiculo> findAll() {
    return repository.findAllByEmpresaId(tenantContext.getCurrentEmpresaId());
  }

  @Override
  public List<DeTipoVehiculo> findAllActivos() {
    return repository.findAllByEmpresaIdAndActivoTrue(tenantContext.getCurrentEmpresaId());
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    DeTipoVehiculo tipo = findById(id);
    tipo.setActivo(false);
    repository.save(tipo);
  }
}
