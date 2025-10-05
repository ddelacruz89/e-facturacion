package com.braintech.eFacturador.interfaces;

import com.braintech.eFacturador.models.Response;

public interface IBase<T> {
  Response<?> getFindById(Integer id, Integer empresaId);

  Response<?> getFindByAll(Integer empresaId);

  Response<?> save(T entity);
}
