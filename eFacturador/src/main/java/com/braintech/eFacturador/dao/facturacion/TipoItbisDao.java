package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfSucursalItbis;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoItbisDao extends JpaRepository<MfSucursalItbis, Integer> {
  // MgItbis extends BaseEntity - no multi-tenant filtering required (system-wide data)
  // Use standard JpaRepository methods: findAll(), findById(), etc.
}
