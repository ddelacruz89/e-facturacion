package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorPagosHeader;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MfFacturaSuplidorPagosRepository
    extends JpaRepository<MfFacturaSuplidorPagosHeader, Integer> {}
