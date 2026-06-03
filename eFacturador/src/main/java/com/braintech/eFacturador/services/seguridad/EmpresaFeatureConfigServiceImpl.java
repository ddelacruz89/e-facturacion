package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgEmpresaFeatureConfigRepository;
import com.braintech.eFacturador.dto.seguridad.EmpresaFeatureConfigDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.seguridad.EmpresaFeatureConfigService;
import com.braintech.eFacturador.interfaces.seguridad.FeaturePlanService;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresaFeatureConfig;
import com.braintech.eFacturador.util.TenantContext;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmpresaFeatureConfigServiceImpl implements EmpresaFeatureConfigService {

  private static final Set<String> SENSITIVE_KEYS =
      Set.of("secretAccessKey", "connectionString", "password");

  private final SgEmpresaFeatureConfigRepository repository;
  private final FeaturePlanService featurePlanService;
  private final TenantContext tenantContext;
  private final ObjectMapper objectMapper;

  @Override
  public EmpresaFeatureConfigDTO getConfig(String featureId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    boolean habilitado = featurePlanService.isHabilitado(empresaId, featureId);

    return repository
        .findByEmpresaIdAndFeatureId(empresaId, featureId)
        .map(cfg -> toDTO(cfg, habilitado))
        .orElseGet(
            () -> {
              EmpresaFeatureConfigDTO dto = new EmpresaFeatureConfigDTO();
              dto.setEmpresaId(empresaId);
              dto.setFeatureId(featureId);
              dto.setActivo(false);
              dto.setHabilitadoComercialmente(habilitado);
              return dto;
            });
  }

  @Override
  @Transactional
  public SgEmpresaFeatureConfig save(String featureId, SgEmpresaFeatureConfig incoming) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    if (!featurePlanService.isHabilitado(empresaId, featureId)) {
      throw new IllegalStateException(
          "El feature '" + featureId + "' no está habilitado en tu plan.");
    }

    return repository
        .findByEmpresaIdAndFeatureId(empresaId, featureId)
        .map(
            existing -> {
              existing.setActivo(incoming.getActivo());
              existing.setStorageTipo(incoming.getStorageTipo());
              // Solo actualiza storageConfig si el cliente envió uno nuevo (no es null ni vacío)
              if (incoming.getStorageConfig() != null && !incoming.getStorageConfig().isBlank()) {
                existing.setStorageConfig(incoming.getStorageConfig());
              }
              return repository.save(existing);
            })
        .orElseGet(
            () -> {
              incoming.setEmpresaId(empresaId);
              incoming.setFeatureId(featureId);
              incoming.setFechaReg(LocalDateTime.now());
              incoming.setUsuarioReg(username);
              return repository.save(incoming);
            });
  }

  @Override
  public boolean isFeatureActivo(String featureId) {
    return isFeatureActivo(featureId, tenantContext.getCurrentEmpresaId());
  }

  @Override
  public boolean isFeatureActivo(String featureId, Integer empresaId) {
    if (!featurePlanService.isHabilitado(empresaId, featureId)) return false;
    return repository
        .findByEmpresaIdAndFeatureId(empresaId, featureId)
        .map(cfg -> Boolean.TRUE.equals(cfg.getActivo()))
        .orElse(false);
  }

  @Override
  public SgEmpresaFeatureConfig getRaw(String featureId, Integer empresaId) {
    return repository
        .findByEmpresaIdAndFeatureId(empresaId, featureId)
        .orElseThrow(
            () ->
                new RecordNotFoundException(
                    "Configuración de feature no encontrada: " + featureId));
  }

  private EmpresaFeatureConfigDTO toDTO(SgEmpresaFeatureConfig cfg, boolean habilitado) {
    EmpresaFeatureConfigDTO dto = new EmpresaFeatureConfigDTO();
    dto.setId(cfg.getId());
    dto.setEmpresaId(cfg.getEmpresaId());
    dto.setFeatureId(cfg.getFeatureId());
    dto.setActivo(cfg.getActivo());
    dto.setStorageTipo(cfg.getStorageTipo());
    dto.setHabilitadoComercialmente(habilitado);

    if (cfg.getStorageConfig() != null && !cfg.getStorageConfig().isBlank()) {
      dto.setStorageConfig(maskSensitiveFields(cfg.getStorageConfig()));
    }

    return dto;
  }

  private Map<String, Object> maskSensitiveFields(String json) {
    try {
      Map<String, Object> parsed = objectMapper.readValue(json, new TypeReference<>() {});
      Map<String, Object> masked = new HashMap<>(parsed);
      SENSITIVE_KEYS.forEach(
          key -> {
            if (masked.containsKey(key)) masked.put(key, "***");
          });
      return masked;
    } catch (IOException e) {
      log.warn("No se pudo parsear storageConfig para enmascarar: {}", e.getMessage());
      return Map.of();
    }
  }
}
