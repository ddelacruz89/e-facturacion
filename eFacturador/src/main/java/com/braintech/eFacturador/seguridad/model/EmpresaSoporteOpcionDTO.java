package com.braintech.eFacturador.seguridad.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Empresa disponible para un usuario de soporte durante el flujo de login. Retornada en {@code
 * LoginResponse.empresasSoporteDisponibles} cuando el usuario soporte tiene grants activos en más
 * de una empresa.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaSoporteOpcionDTO {
  private Integer empresaId;
  private String empresaNombre;

  /** Cuándo expira el acceso de soporte para esta empresa. */
  private LocalDateTime fechaExpiracion;
}
