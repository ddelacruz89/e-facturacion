package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgEmpresaIpPermitidaRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.seguridad.SgEmpresaIpPermitidaService;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresaIpPermitida;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SgEmpresaIpPermitidaServiceImpl implements SgEmpresaIpPermitidaService {

  private final SgEmpresaIpPermitidaRepository repository;
  private final TenantContext tenantContext;

  @Override
  public List<SgEmpresaIpPermitida> getAll() {
    return repository.findByEmpresaIdOrderByFechaRegDesc(tenantContext.getCurrentEmpresaId());
  }

  @Override
  public SgEmpresaIpPermitida save(SgEmpresaIpPermitida ip) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    ip.setEmpresaId(empresaId);
    ip.setFechaReg(LocalDateTime.now());
    ip.setUsuarioReg(tenantContext.getCurrentUsername());
    ip.setActivo(true);
    return repository.save(ip);
  }

  @Override
  public SgEmpresaIpPermitida toggleActivo(Integer id) {
    SgEmpresaIpPermitida ip =
        repository
            .findByIdAndEmpresaId(id, tenantContext.getCurrentEmpresaId())
            .orElseThrow(() -> new RecordNotFoundException("IP no encontrada: " + id));
    ip.setActivo(!Boolean.TRUE.equals(ip.getActivo()));
    return repository.save(ip);
  }

  @Override
  public void delete(Integer id) {
    SgEmpresaIpPermitida ip =
        repository
            .findByIdAndEmpresaId(id, tenantContext.getCurrentEmpresaId())
            .orElseThrow(() -> new RecordNotFoundException("IP no encontrada: " + id));
    repository.delete(ip);
  }

  @Override
  public boolean ipAutorizada(Integer empresaId, String ip) {
    if (!repository.existsByEmpresaIdAndActivoTrue(empresaId)) {
      return true; // sin restricciones configuradas
    }
    return repository.existsByEmpresaIdAndIpOrigenAndActivoTrue(empresaId, ip);
  }
}
