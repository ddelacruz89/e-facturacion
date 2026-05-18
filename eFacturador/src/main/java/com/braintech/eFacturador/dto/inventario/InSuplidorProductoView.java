package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;

/**
 * JPA projection interface para la query nativa que obtiene los productos asociados a un suplidor.
 */
public interface InSuplidorProductoView {

  Integer getId();

  Integer getProductoId();

  String getProductoNombre();

  BigDecimal getPrecio();

  String getEstadoId();
}
