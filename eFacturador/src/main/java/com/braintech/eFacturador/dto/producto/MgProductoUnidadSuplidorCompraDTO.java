package com.braintech.eFacturador.dto.producto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MgProductoUnidadSuplidorCompraDTO {
  private Integer id;
  private String unidadNombre;
  private String unidadSigla;
  private String unidadFraccionNombre;
  private String unidadFraccionSigla;
  private Integer cantidad;
  private MgProductoSuplidorCompraDTO suplidor;
}
