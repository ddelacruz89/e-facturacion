package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.jpa.producto.MgUnidadFraccion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgUnidadFraccionRepository extends JpaRepository<MgUnidadFraccion, Integer> {
  // MgUnidadFraccion extends BaseEntity - filter by empresaId only
  // This entity defines unit conversions (e.g., 1 box = 12 units), not product-specific data

  @Query("SELECT uf FROM MgUnidadFraccion uf WHERE uf.empresaId = :empresaId")
  List<MgUnidadFraccion> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT uf FROM MgUnidadFraccion uf WHERE uf.empresaId = :empresaId AND uf.activo = true")
  List<MgUnidadFraccion> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT uf FROM MgUnidadFraccion uf WHERE uf.id = :id AND uf.empresaId = :empresaId")
  Optional<MgUnidadFraccion> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);
}
