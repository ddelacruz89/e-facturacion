package com.braintech.eFacturador.interfaces.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgFeaturePlan;
import java.util.List;

public interface FeaturePlanService {

  /** Retorna todos los feature plans de una empresa. */
  List<SgFeaturePlan> findAllByEmpresa(Integer empresaId);

  /** Retorna todas las empresas que tienen un feature habilitado. */
  List<SgFeaturePlan> findAllByFeature(String featureId);

  /** Crea o actualiza el feature plan de una empresa. */
  SgFeaturePlan save(SgFeaturePlan plan);

  /** Retorna true si la empresa tiene el feature habilitado comercialmente. */
  boolean isHabilitado(Integer empresaId, String featureId);
}
