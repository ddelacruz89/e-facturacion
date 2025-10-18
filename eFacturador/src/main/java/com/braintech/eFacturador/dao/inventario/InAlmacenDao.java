package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InAlmacenDao extends JpaRepository<InAlmacen, Integer> {
  // InAlmacen extends BaseSucursal - filter by empresaId AND sucursalId

  @Query("SELECT a FROM InAlmacen a WHERE a.empresaId = :empresaId")
  List<InAlmacen> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query(
      "SELECT a FROM InAlmacen a WHERE a.empresaId = :empresaId AND a.sucursalId.id = :sucursalId")
  List<InAlmacen> findAllByEmpresaIdAndSucursalId(
      @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);

  @Query("SELECT a FROM InAlmacen a WHERE a.id = :id AND a.empresaId = :empresaId")
  Optional<InAlmacen> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT a FROM InAlmacen a WHERE a.id = :id AND a.empresaId = :empresaId AND a.sucursalId.id = :sucursalId")
  Optional<InAlmacen> findByIdAndEmpresaIdAndSucursalId(
      @Param("id") Integer id,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);
}
