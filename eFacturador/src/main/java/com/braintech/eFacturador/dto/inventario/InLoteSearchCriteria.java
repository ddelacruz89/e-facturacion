package com.braintech.eFacturador.dto.inventario;

import lombok.Data;

@Data
public class InLoteSearchCriteria {
  private String lote;
  private Integer productoId;
  private String estadoId;
  private int page = 0;
  private int size = 10;
}
