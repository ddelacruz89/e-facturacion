package com.braintech.eFacturador.dto.inventario;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InAjusteInventarioResumenDTO {
  private Integer id;
  private LocalDateTime fechaReg;
  private Integer almacenId;
  private String estadoId;
  private String movimientoTipoNombre;
  private String observacion;
  private String usuarioReg;
  private Integer totalLineas;
}
