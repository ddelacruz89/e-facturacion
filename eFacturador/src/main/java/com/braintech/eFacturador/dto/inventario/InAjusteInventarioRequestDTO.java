package com.braintech.eFacturador.dto.inventario;

import java.util.List;
import lombok.Data;

@Data
public class InAjusteInventarioRequestDTO {
  private Integer almacenId;

  /** ID del tipo de movimiento de ajuste (FK a in_movimientos_tipos, requerido). */
  private Integer movimientoTipoId;

  /** Nota libre opcional. */
  private String observacion;

  private List<InAjusteInventarioDetalleRequestDTO> detalles;
}
