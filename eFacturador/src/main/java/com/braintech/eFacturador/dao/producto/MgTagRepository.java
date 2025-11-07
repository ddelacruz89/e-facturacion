package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.jpa.producto.MgTag;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgTagRepository extends JpaRepository<MgTag, Integer> {
  // MgTag extends BaseEntityEmpresa - filter by empresaId only

  @Query("SELECT t FROM MgTag t WHERE t.empresaId = :empresaId")
  List<MgTag> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT t FROM MgTag t WHERE t.empresaId = :empresaId AND t.activo = true")
  List<MgTag> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT t FROM MgTag t WHERE t.id = :id AND t.empresaId = :empresaId")
  Optional<MgTag> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT t FROM MgTag t WHERE t.nombre = :nombre AND t.empresaId = :empresaId AND t.activo = true")
  Optional<MgTag> findByNombreAndEmpresaId(
      @Param("nombre") String nombre, @Param("empresaId") Integer empresaId);
}
