package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgFeaturePlanRepository;
import com.braintech.eFacturador.interfaces.seguridad.FeaturePlanService;
import com.braintech.eFacturador.jpa.seguridad.SgFeaturePlan;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeaturePlanServiceImpl implements FeaturePlanService {

  private final SgFeaturePlanRepository repository;
  private final TenantContext tenantContext;

  @Override
  public List<SgFeaturePlan> findAllByEmpresa(Integer empresaId) {
    return repository.findAllByEmpresaId(empresaId);
  }

  @Override
  public List<SgFeaturePlan> findAllByFeature(String featureId) {
    return repository.findAllByFeatureId(featureId);
  }

  @Override
  @Transactional
  public SgFeaturePlan save(SgFeaturePlan plan) {
    String username = tenantContext.getCurrentUsername();

    return repository
        .findByEmpresaIdAndFeatureId(plan.getEmpresaId(), plan.getFeatureId())
        .map(
            existing -> {
              existing.setHabilitado(plan.getHabilitado());
              return repository.save(existing);
            })
        .orElseGet(
            () -> {
              plan.setFechaReg(LocalDateTime.now());
              plan.setUsuarioReg(username);
              return repository.save(plan);
            });
  }

  @Override
  public boolean isHabilitado(Integer empresaId, String featureId) {
    return repository
        .findByEmpresaIdAndFeatureId(empresaId, featureId)
        .map(SgFeaturePlan::getHabilitado)
        .orElse(false);
  }
}
