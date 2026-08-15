package com.braintech.eFacturador.dto.contabilidad;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Nodo del árbol de cuentas — mínima data necesaria para pintar una fila. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class McCuentaNodoDTO {
  private Integer id;
  private Integer cuentaPadreId;
  private String cuenta;
  private String nombreCuenta;
  private Integer nivel;
  private Boolean permiteMovimiento;
  private BigDecimal saldoCuenta;
  private String estadoId;
  private Integer tipoCuentaId;
  private String tipoCuentaNombre;

  /**
   * {@code true} si tiene cuentas hijas — controla si el frontend muestra la flecha de expandir.
   */
  private Boolean tieneHijos;
}
