package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgTipoComprobante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoComprobanteDao extends JpaRepository<MgTipoComprobante, String> {}
