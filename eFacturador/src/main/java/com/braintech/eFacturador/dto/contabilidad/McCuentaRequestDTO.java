package com.braintech.eFacturador.dto.contabilidad;

import lombok.Data;

@Data
public class McCuentaRequestDTO {
  private Integer tipoCuentaId;
  private Integer cuentaPadreId;
  private String nivel1;
  private String nivel2;
  private String nivel3;
  private String nivel4;
  private Integer nivel;
  private Integer orden;
  private String cuenta;
  private String nombreCuenta;
  private Boolean permiteMovimiento;
}
