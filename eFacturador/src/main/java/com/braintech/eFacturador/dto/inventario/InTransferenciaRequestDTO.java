package com.braintech.eFacturador.dto.inventario;

import java.util.List;
import lombok.Data;

@Data
public class InTransferenciaRequestDTO {

  private Integer origenAlmacenId;
  private Integer destinoAlmacenId;
  private String estadoId;
  private Integer requisicionId;
  private List<InTransferenciaDetalleRequestDTO> detalles;
}
