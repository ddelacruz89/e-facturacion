package com.braintech.eFacturador.dto.inventario;

import lombok.Data;

@Data
public class InAjusteInventarioDetalleRequestDTO {
  private Integer productoId;
  private String lote;

  /** Stock actual que el frontend leyó antes de enviar (para auditoría). */
  private Double cantidadActual;

  /** Nuevo stock deseado. */
  private Double cantidadNueva;
}
