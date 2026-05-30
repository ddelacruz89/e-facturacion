package com.braintech.eFacturador.dto.despacho;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MisEntregasRutaDTO {
  private Integer rutaId;
  private Integer rutaSecuencia;
  private LocalDate fecha;
  private String vehiculoDescripcion;
  private String vehiculoPlaca;
  private String estadoRuta;
  private List<MisEntregasOrdenDTO> ordenes;
}
