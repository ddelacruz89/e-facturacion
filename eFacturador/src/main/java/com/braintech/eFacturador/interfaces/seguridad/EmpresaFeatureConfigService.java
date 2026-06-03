package com.braintech.eFacturador.interfaces.seguridad;

import com.braintech.eFacturador.dto.seguridad.EmpresaFeatureConfigDTO;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresaFeatureConfig;

public interface EmpresaFeatureConfigService {

  /**
   * Retorna la configuración del feature para la empresa del usuario actual (con credenciales
   * enmascaradas).
   */
  EmpresaFeatureConfigDTO getConfig(String featureId);

  /**
   * Guarda o actualiza la configuración. Solo procede si el feature está habilitado comercialmente.
   */
  SgEmpresaFeatureConfig save(String featureId, SgEmpresaFeatureConfig config);

  /**
   * Retorna true si el feature está activo para la empresa del contexto actual. Combina el check
   * comercial (FeaturePlan.habilitado) y la activación (EmpresaFeatureConfig.activo).
   */
  boolean isFeatureActivo(String featureId);

  /**
   * Sobrecarga interna usada por otros servicios que ya tienen empresaId. No accede al
   * TenantContext.
   */
  boolean isFeatureActivo(String featureId, Integer empresaId);

  /** Retorna la entidad cruda (con credenciales) para uso interno por el StorageServiceFactory. */
  SgEmpresaFeatureConfig getRaw(String featureId, Integer empresaId);
}
