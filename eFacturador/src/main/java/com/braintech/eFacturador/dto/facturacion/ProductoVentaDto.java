package com.braintech.eFacturador.dto.facturacion;

import com.braintech.eFacturador.jpa.general.MgItbis;
import com.braintech.eFacturador.jpa.inventario.InInventario;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Getter
public class ProductoVentaDto {

  private Integer Id;

  private Integer secuencia;

  private String codigoBarra;

  private String nombreProducto;

  private String descripcion;

  private BigDecimal precioVenta;

  private BigDecimal precioCostoAvg;

  public ProductoVentaDto(
      Integer id,
      Integer secuencia,
      String codigoBarra,
      String nombreProducto,
      String descripcion,
      MgItbis itbisId,
      BigDecimal precioVenta,
      BigDecimal precioCostoAvg) {
    this.Id = id;
    this.secuencia = secuencia;
    this.codigoBarra = codigoBarra;
    this.nombreProducto = nombreProducto;
    this.descripcion = descripcion;
    this.precioVenta = precioVenta;
    this.precioCostoAvg = precioCostoAvg;
  }
}
