package com.braintech.eFacturador.models;

import com.braintech.eFacturador.jpa.general.MgItbis;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public interface IProductoVenta {
  Integer getId();

  Integer getSecuencia();

  String getCodigoBarra();

  String getNombreProducto();

  String getDescripcion();

  MgItbis getItbisId();

  List<IInventario> getInventarios();

  BigDecimal getPrecioVenta();

  BigDecimal getPrecioCostoAvg();

  default BigDecimal getItbis() {
    if (getItbisId() != null) {
      return getItbisId()
          .getItbis()
          .divide(BigDecimal.valueOf(100))
          .setScale(2, RoundingMode.HALF_UP);
    }
    return BigDecimal.ZERO;
  }

  default BigDecimal getPrecioItbis() {
    BigDecimal precioVenta = getPrecioVenta() != null ? getPrecioVenta() : BigDecimal.ZERO;
    return precioVenta.multiply(getItbis());
  }
}
