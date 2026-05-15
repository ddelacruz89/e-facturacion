package com.braintech.eFacturador.dto.producto;

import java.math.BigDecimal;

public class MgProductoResumenDTO {
  private Integer id;
  private String nombreProducto;
  private BigDecimal precioVenta;

  public MgProductoResumenDTO(Integer id, String nombreProducto) {
    this.id = id;
    this.nombreProducto = nombreProducto;
  }

  public MgProductoResumenDTO(Integer id, String nombreProducto, BigDecimal precioVenta) {
    this.id = id;
    this.nombreProducto = nombreProducto;
    this.precioVenta = precioVenta;
  }

  public Integer getId() {
    return id;
  }

  public String getNombreProducto() {
    return nombreProducto;
  }

  public BigDecimal getPrecioVenta() {
    return precioVenta;
  }
}
