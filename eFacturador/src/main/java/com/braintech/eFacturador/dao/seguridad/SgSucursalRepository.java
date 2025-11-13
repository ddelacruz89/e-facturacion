package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgSucursalRepository extends JpaRepository<SgSucursal, Integer> {
  // SgSucursal extends BaseEntity - no multi-tenant filtering required (system-wide data)
  // However, we can query by empresa for convenience

  @Query("SELECT s FROM SgSucursal s WHERE s.empresa.id = :empresaId")
  List<SgSucursal> findByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT s FROM SgSucursal s WHERE s.activo = true")
  List<SgSucursal> findAllActive();
}
