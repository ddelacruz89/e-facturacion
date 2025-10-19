package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MgItbis;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgItbisRepository extends JpaRepository<MgItbis, Integer> {
  // MgItbis extends BaseEntity - no multi-tenant filtering required (system-wide data)

  @Query("SELECT i FROM MgItbis i WHERE i.activo = true")
  List<MgItbis> findAllActive();

  @Query("SELECT i FROM MgItbis i WHERE i.id = :id")
  Optional<MgItbis> findById(@Param("id") Integer id);
}
