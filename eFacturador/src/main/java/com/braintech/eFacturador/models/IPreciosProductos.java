package com.braintech.eFacturador.models;

import java.math.BigDecimal;

public interface IPreciosProductos {
  BigDecimal getPrecioVenta();

  IUnidad getUnidadFraccionId();
}
