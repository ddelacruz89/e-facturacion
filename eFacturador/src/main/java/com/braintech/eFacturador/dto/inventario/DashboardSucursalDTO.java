package com.braintech.eFacturador.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Sucursal accesible por el usuario — usada en el selector del dashboard. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSucursalDTO {
  private Integer id;
  private String nombre;
}
