package com.braintech.eFacturador.dto.seguridad;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmpresaFeatureConfigDTO {

  private Integer id;
  private Integer empresaId;
  private String featureId;
  private Boolean activo;
  private String storageTipo;

  /**
   * Credenciales del storage con campos sensibles enmascarados. Los campos "secretAccessKey" y
   * "connectionString" se reemplazan por "***" en las respuestas GET.
   */
  private Map<String, Object> storageConfig;

  /** true si el feature está habilitado comercialmente (el cliente lo pagó). */
  private Boolean habilitadoComercialmente;
}
