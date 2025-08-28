package com.braintech.eFacturador.interfaces;

import com.braintech.eFacturador.jpa.producto.MgCategoria;
import com.braintech.eFacturador.models.Response;

public interface IBase {
    Response<?> getFindById(Integer id,Integer empresaId);

    Response<?> getFindByAll(Integer empresaId);

    <T> Response<?> save(T entity);
}
