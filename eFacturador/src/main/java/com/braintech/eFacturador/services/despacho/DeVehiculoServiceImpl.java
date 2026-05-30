package com.braintech.eFacturador.services.despacho;

import com.braintech.eFacturador.dao.despacho.DeVehiculoRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.despacho.DeVehiculoService;
import com.braintech.eFacturador.jpa.despacho.DeVehiculo;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class DeVehiculoServiceImpl implements DeVehiculoService {

  private final DeVehiculoRepository vehiculoRepository;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public DeVehiculo save(DeVehiculo vehiculo) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    vehiculo.setEmpresaId(empresaId);
    if (vehiculo.getActivo() == null) vehiculo.setActivo(true);
    return vehiculoRepository.save(vehiculo);
  }

  @Override
  public DeVehiculo findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return vehiculoRepository
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Vehículo no encontrado: " + id));
  }

  @Override
  public List<DeVehiculo> findAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return vehiculoRepository.findAllByEmpresaId(empresaId);
  }

  @Override
  public List<DeVehiculo> findAllActivos() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return vehiculoRepository.findAllActivosByEmpresaId(empresaId);
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    DeVehiculo vehiculo = findById(id);
    vehiculo.setActivo(false);
    vehiculoRepository.save(vehiculo);
  }
}
