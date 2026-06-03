package com.braintech.eFacturador.dto.facturacion;

import com.braintech.eFacturador.jpa.general.MgItbis;
import com.braintech.eFacturador.jpa.inventario.InInventario;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.Getter;

@Getter
public class PrecioVentaDto {

  private Integer Id;

  private Integer secuencia;

  private String codigoBarra;

  private String nombreProducto;

  private String descripcion;

  private MgItbis ItbisId;

  private List<InInventario> inventarios;

  private BigDecimal precioVenta;

  private BigDecimal precioCostoAvg;

  public PrecioVentaDto(
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
    this.ItbisId = itbisId;
    this.inventarios = null;
    this.precioVenta = precioVenta;
    this.precioCostoAvg = precioCostoAvg;
  }

  public BigDecimal getItbis() {
    if (getItbisId() != null) {
      return getItbisId()
          .getItbis()
          .divide(BigDecimal.valueOf(100))
          .setScale(2, RoundingMode.HALF_UP);
    }
    return BigDecimal.ZERO;
  }

  public BigDecimal getPrecioItbis() {
    BigDecimal precioVenta = getPrecioVenta() != null ? getPrecioVenta() : BigDecimal.ZERO;
    return precioVenta.multiply(getItbis());
  }
}
