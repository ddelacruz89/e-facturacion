package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAjusteBarDTO {
  private Integer tipoId;
  private String tipoNombre;
  private long total;
}
