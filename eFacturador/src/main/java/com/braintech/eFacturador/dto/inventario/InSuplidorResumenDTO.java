package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InSuplidorResumenDTO {

  private Integer id;
  private String nombre;
  private String rnc;
  private String telefono1;
  private String estadoId;
  private Boolean activo;
  private String usuarioReg;

  /** ID del tipo de comprobante (ECF), p.ej. "01", "43". */
  private String tipoComprobanteId;

  /** Descripción del tipo de comprobante para mostrar en tabla. */
  private String tipoComprobanteDesc;
}
