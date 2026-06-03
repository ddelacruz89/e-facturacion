package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgFeaturePlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SgFeaturePlanRepository extends JpaRepository<SgFeaturePlan, Integer> {

  Optional<SgFeaturePlan> findByEmpresaIdAndFeatureId(Integer empresaId, String featureId);

  List<SgFeaturePlan> findAllByEmpresaId(Integer empresaId);

  List<SgFeaturePlan> findAllByFeatureId(String featureId);
}
