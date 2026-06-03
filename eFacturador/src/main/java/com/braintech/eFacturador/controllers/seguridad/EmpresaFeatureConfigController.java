package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.dto.seguridad.EmpresaFeatureConfigDTO;
import com.braintech.eFacturador.interfaces.seguridad.EmpresaFeatureConfigService;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresaFeatureConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Configuración de features por empresa. La empresa gestiona su propio feature (activo +
 * credenciales de storage). Ruta base: /api/v1/empresa/feature-config
 */
@RestController
@RequestMapping("api/v1/empresa/feature-config")
@RequiredArgsConstructor
public class EmpresaFeatureConfigController {

  private final EmpresaFeatureConfigService featureConfigService;

  /**
   * Retorna la configuración actual del feature para la empresa autenticada. Las credenciales
   * sensibles están enmascaradas.
   */
  @GetMapping("/{featureId}")
  public ResponseEntity<EmpresaFeatureConfigDTO> getConfig(@PathVariable String featureId) {
    return ResponseEntity.ok(featureConfigService.getConfig(featureId));
  }

  /**
   * Guarda o actualiza la configuración del feature. Body: { activo, storageTipo, storageConfig:
   * {...} } storageConfig debe enviarse como JSON string dentro del body. Si no se envía
   * storageConfig (null), se conservan las credenciales existentes.
   */
  @PutMapping("/{featureId}")
  public ResponseEntity<EmpresaFeatureConfigDTO> save(
      @PathVariable String featureId, @RequestBody SgEmpresaFeatureConfig config) {
    featureConfigService.save(featureId, config);
    return ResponseEntity.ok(featureConfigService.getConfig(featureId));
  }
}
