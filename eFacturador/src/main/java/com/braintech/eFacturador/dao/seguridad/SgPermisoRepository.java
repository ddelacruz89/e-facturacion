package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgPermiso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgPermisoRepository extends JpaRepository<SgPermiso, Integer> {

  List<SgPermiso> findByRolIdAndEmpresaId(Integer rolId, Integer empresaId);

  @Modifying
  @Query("DELETE FROM SgPermiso p WHERE p.rol.id = :rolId AND p.empresaId = :empresaId")
  void deleteByRolIdAndEmpresaId(
      @Param("rolId") Integer rolId, @Param("empresaId") Integer empresaId);
}
