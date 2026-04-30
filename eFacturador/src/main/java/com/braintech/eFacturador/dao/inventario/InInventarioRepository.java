package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InLoteStockDTO;
import com.braintech.eFacturador.jpa.inventario.InInventario;
import java.util.List;
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

  @Query(
      "SELECT new com.braintech.eFacturador.dto.inventario.InLoteStockDTO("
          + "i.almacenId.id, i.almacenId.nombre, i.cantidad) "
          + "FROM InInventario i "
          + "WHERE i.loteId = :lote "
          + "AND i.productoId.id = :productoId "
          + "AND i.empresaId = :empresaId "
          + "AND i.cantidad > 0")
  List<InLoteStockDTO> findStockByLoteAndProducto(
      @Param("lote") String lote,
      @Param("productoId") Integer productoId,
      @Param("empresaId") Integer empresaId);
}
