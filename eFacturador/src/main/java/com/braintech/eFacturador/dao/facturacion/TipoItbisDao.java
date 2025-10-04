package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgItbis;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoItbisDao extends JpaRepository<MgItbis,Integer> {
}
