package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorPagosHeader;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MfFacturaSuplidorPagosRepository
    extends JpaRepository<MfFacturaSuplidorPagosHeader, Integer> {

  @Query(
      "SELECT COALESCE(SUM(p.pagado), 0) FROM MfFacturaSuplidorPagosHeader p "
          + "WHERE p.facturaSuplidor.id = :facturaSuplidorId AND p.estadoId = 'ACT'")
  BigDecimal sumPagadoActivoByFacturaSuplidorId(
      @Param("facturaSuplidorId") Integer facturaSuplidorId);
}
