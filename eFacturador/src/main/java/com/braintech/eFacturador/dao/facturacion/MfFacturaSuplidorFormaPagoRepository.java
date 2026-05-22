package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorFormaPago;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MfFacturaSuplidorFormaPagoRepository
    extends JpaRepository<MfFacturaSuplidorFormaPago, Integer> {
  List<MfFacturaSuplidorFormaPago> findByEstadoId(String estadoId);
}
