package com.braintech.eFacturador.jpa.producto;

public interface ProductoResumen {
  Long getId();

  String getCodigo();

  String getNombreProducto();

  MgCategoria getCategoriaId();
}
