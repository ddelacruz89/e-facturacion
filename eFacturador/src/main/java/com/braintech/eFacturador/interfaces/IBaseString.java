package com.braintech.eFacturador.interfaces;

import com.braintech.eFacturador.models.Response;

public interface IBaseString<T> {

  Response<?> getFindById(String id);

  Response<?> getFindByAll();

  Response<?> save(T entity);
}
