package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgTipoFactura;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoFacturaDao extends JpaRepository<MgTipoFactura, Integer> {
  // MgTipoFactura extends BaseEntity - no multi-tenant filtering required (system-wide data)
  // Use standard JpaRepository methods: findAll(), findById(), etc.
}
