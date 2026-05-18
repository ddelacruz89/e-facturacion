package com.braintech.eFacturador.dto.inventario;

import lombok.Data;

@Data
public class InAlmacenRequestDTO {
  private String nombre;
  private String ubicacion;

  /** Sucursal a la que pertenece el almacén. Se recibe del frontend, no del TenantContext. */
  private Integer sucursalId;
}
