package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FacturaDao extends JpaRepository<MfFactura, Integer> {

  @Query(
      """
            select f from MfFactura f where f.numeroFactura = ?1 and f.empresaId = ?2
            """)
  Optional<MfFactura> getFacturaByNumeroFactura(Integer numeroFactura, Integer empresaId);

  @Query(
      """
            select f from MfFactura f where  f.empresaId = ?1
            """)
  List<MfFactura> getFindByAll(Integer empresaId);
}
