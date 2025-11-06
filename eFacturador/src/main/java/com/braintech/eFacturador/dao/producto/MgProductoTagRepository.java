package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.jpa.producto.MgProductoTag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgProductoTagRepository extends JpaRepository<MgProductoTag, Integer> {
  // MgProductoTag extends BaseEntityEmpresa - filter by empresaId only

  @Query(
      "SELECT pt FROM MgProductoTag pt WHERE pt.producto.id = :productoId AND pt.empresaId = :empresaId AND pt.activo = true")
  List<MgProductoTag> findByProductoIdAndEmpresaId(
      @Param("productoId") Integer productoId, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT pt FROM MgProductoTag pt WHERE pt.tag.id = :tagId AND pt.empresaId = :empresaId AND pt.activo = true")
  List<MgProductoTag> findByTagIdAndEmpresaId(
      @Param("tagId") Integer tagId, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT CASE WHEN COUNT(pt) > 0 THEN true ELSE false END FROM MgProductoTag pt WHERE pt.producto.id = :productoId AND pt.tag.id = :tagId AND pt.empresaId = :empresaId AND pt.activo = true")
  boolean existsByProductoIdAndTagIdAndEmpresaId(
      @Param("productoId") Integer productoId,
      @Param("tagId") Integer tagId,
      @Param("empresaId") Integer empresaId);
}
