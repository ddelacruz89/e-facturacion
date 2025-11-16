package com.braintech.eFacturador.dto.producto;

public class MgProductoResumenDTO {
  private Integer id;
  private String nombreProducto;

  public MgProductoResumenDTO(Integer id, String nombreProducto) {
    this.id = id;
    this.nombreProducto = nombreProducto;
  }

  public Integer getId() {
    return id;
  }

  public String getNombreProducto() {
    return nombreProducto;
  }
}
