package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import java.util.List;

public interface InAlmacenService {
    InAlmacen save(InAlmacen almacen);
    InAlmacen findById(Integer id);
    List<InAlmacen> findAll();
    void deleteById(Integer id);
}

