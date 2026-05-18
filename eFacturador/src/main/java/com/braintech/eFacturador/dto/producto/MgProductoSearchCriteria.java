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
  // El filtro de empresaId se obtiene del contexto, no del query, por lo que no se expone aquí
}
