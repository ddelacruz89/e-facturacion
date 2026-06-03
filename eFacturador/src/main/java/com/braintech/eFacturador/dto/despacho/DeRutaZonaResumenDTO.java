package com.braintech.eFacturador.dto.despacho;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeRutaZonaResumenDTO {
  private Integer id;
  private Integer rutaId;
  private String codProvincia;
  private String provinciaNombre;
  private Integer municipioId;
  private String municipioNombre;
  private Integer barrioId;
  private String barrioNombre;
}
