package com.braintech.eFacturador.models;

import jakarta.persistence.*;

public interface IInventario {
  Integer getId();

  Double getCantidad();

  IAlmacen getAlmacenId();

  String getEstadoProductoInventario();

  String getLoteId();
}
