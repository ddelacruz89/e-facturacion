package com.braintech.eFacturador.interfaces;

import com.braintech.eFacturador.models.Response;

public interface IBaseString {

    Response<?> getFindById(String id);
    Response<?> getFindByAll();

    <T> Response<?> save(T entity);
}
