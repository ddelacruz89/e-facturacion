package com.braintech.eFacturador.dto.despacho;

import java.time.LocalDate;
import lombok.Data;

@Data
public class DeOrdenDespachoSearchCriteria {
  private LocalDate fechaInicio;
  private LocalDate fechaFin;
  private Integer facturaSecuencia;
  private String clienteNombre;
  private String estadoId;
  private Integer rutaId;
  private int page = 0;
  private int size = 10;
}
