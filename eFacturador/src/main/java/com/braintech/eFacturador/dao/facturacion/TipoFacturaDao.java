package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgTipoFactura;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TipoFacturaDao extends JpaRepository<MgTipoFactura, Integer> {

  @Override
  @Query("select t from MgTipoFactura t order by t.id asc")
  List<MgTipoFactura> findAll();
}
