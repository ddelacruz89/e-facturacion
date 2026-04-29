package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InInventario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InInventarioRepository extends JpaRepository<InInventario, Integer> {

  @Query(
      "SELECT i FROM InInventario i "
          + "WHERE i.productoId.id = :productoId "
          + "AND i.almacenId.id = :almacenId "
          + "AND i.empresaId = :empresaId "
          + "AND i.sucursalId.id = :sucursalId")
  Optional<InInventario> findByProductoAndAlmacen(
      @Param("productoId") Integer productoId,
      @Param("almacenId") Integer almacenId,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);
}
