package com.braintech.eFacturador.dto.inventario;

import java.util.List;
import lombok.Data;

@Data
public class InAjusteInventarioRequestDTO {
  private Integer almacenId;
  private String observacion;
  private List<InAjusteInventarioDetalleRequestDTO> detalles;
}
