package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.jpa.producto.MgUnidad;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgUnidadRepository extends JpaRepository<MgUnidad, Integer> {
  // MgUnidad extends BaseEntityEmpresa - filter by empresaId only

  @Query("SELECT u FROM MgUnidad u WHERE u.empresaId = :empresaId")
  List<MgUnidad> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT u FROM MgUnidad u WHERE u.empresaId = :empresaId AND u.activo = true")
  List<MgUnidad> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT u FROM MgUnidad u WHERE u.id = :id AND u.empresaId = :empresaId")
  Optional<MgUnidad> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);
}
