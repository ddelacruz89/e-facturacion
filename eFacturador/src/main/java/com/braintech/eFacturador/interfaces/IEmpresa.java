package com.braintech.eFacturador.interfaces;

import com.braintech.eFacturador.jpa.seguridad.SgEmpresa;
import com.braintech.eFacturador.models.Response;

public interface IEmpresa {
    Response<?> getFindById(Integer id);

    Response<?> getFindByAll();

     Response<?> save(SgEmpresa entity);
}
