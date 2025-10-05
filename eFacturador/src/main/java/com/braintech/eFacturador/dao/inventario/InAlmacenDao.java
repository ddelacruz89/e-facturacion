package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InAlmacenDao extends CrudRepository<InAlmacen, Integer> {}
