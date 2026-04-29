package com.braintech.eFacturador.dto.inventario;

import lombok.Data;

@Data
public class InTransferenciaDetalleRequestDTO {

  private Integer productoId;
  private Integer cant;
  private String lote;
  private Integer numeroReferencia;
  private Integer cantidadUnidad;
  private String unidadDescripcion;
}
