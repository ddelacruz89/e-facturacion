package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgTipoComprobante;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoComprobanteDao extends JpaRepository<MgTipoComprobante, String> {
  List<MgTipoComprobante> findAllByCategoria(String categoria);
}
