package com.braintech.eFacturador.dto.producto;

import lombok.Data;

@Data
public class MgProductoSearchCriteria {
  private Integer id;
  private Integer secuencia;
  private String nombreProducto;
  private String codigoBarra;
  private String descripcion;
  private Integer categoriaId;
  private Integer page = 0;
  private Integer size = 30;
}
