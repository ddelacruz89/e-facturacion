package com.braintech.eFacturador.services.facturacion;

import com.braintech.eFacturador.models.Response;

public interface ITipoEntity<T> {
  Response<?> findAll();

  Response<T> save(T entity);
}
