package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InLoteStockDTO;
import com.braintech.eFacturador.dto.inventario.InLoteStockItemDTO;
import com.braintech.eFacturador.dto.producto.MgProductoResumenDTO;
import com.braintech.eFacturador.jpa.inventario.InInventario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

  /** Stock de un producto en un almacén filtrado opcionalmente por lote (null = sin lote). */
  @Query(
      "SELECT i FROM InInventario i "
          + "WHERE i.productoId.id = :productoId "
          + "AND i.almacenId.id = :almacenId "
          + "AND i.empresaId = :empresaId "
          + "AND i.sucursalId.id = :sucursalId "
          + "AND (:lote IS NULL OR i.loteId = :lote)")
  Optional<InInventario> findByProductoAlmacenLote(
      @Param("productoId") Integer productoId,
      @Param("almacenId") Integer almacenId,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId,
      @Param("lote") String lote);

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

  /**
   * Lotes disponibles (cantidad > 0) para un producto en un almacén específico. Incluye null como
   * lote cuando el producto tiene stock sin lote asignado.
   */
  /** Stock total de un producto en un almacén, sumando todos los lotes. */
  @Query(
      "SELECT COALESCE(SUM(i.cantidad), 0) FROM InInventario i "
          + "WHERE i.productoId.id = :productoId "
          + "AND i.almacenId.id = :almacenId "
          + "AND i.empresaId = :empresaId")
  Integer sumCantidadByProductoAndAlmacen(
      @Param("productoId") Integer productoId,
      @Param("almacenId") Integer almacenId,
      @Param("empresaId") Integer empresaId);

  /** Actualiza el estado de stock en todos los lotes del producto-almacén dado. */
  @Modifying
  @Query(
      "UPDATE InInventario i SET i.estadoProductoInventario = :estado "
          + "WHERE i.productoId.id = :productoId "
          + "AND i.almacenId.id = :almacenId "
          + "AND i.empresaId = :empresaId")
  int updateEstadoByProductoAndAlmacen(
      @Param("productoId") Integer productoId,
      @Param("almacenId") Integer almacenId,
      @Param("empresaId") Integer empresaId,
      @Param("estado") String estado);

  @Query(
      "SELECT i.loteId FROM InInventario i "
          + "WHERE i.productoId.id = :productoId "
          + "AND i.almacenId.id = :almacenId "
          + "AND i.empresaId = :empresaId "
          + "AND i.sucursalId.id = :sucursalId "
          + "AND i.cantidad > 0")
  List<String> findLotesByProductoAndAlmacen(
      @Param("productoId") Integer productoId,
      @Param("almacenId") Integer almacenId,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);

  /**
   * Todos los registros de inventario con stock > 0 para un producto en un almacén, desglosados por
   * lote. Usado para construir el dropdown de lotes en transferencias.
   */
  @Query(
      "SELECT new com.braintech.eFacturador.dto.inventario.InLoteStockItemDTO("
          + "i.loteId, i.cantidad) "
          + "FROM InInventario i "
          + "WHERE i.productoId.id = :productoId "
          + "AND i.almacenId.id = :almacenId "
          + "AND i.empresaId = :empresaId "
          + "AND i.sucursalId.id = :sucursalId "
          + "AND i.cantidad > 0 "
          + "ORDER BY i.loteId ASC NULLS FIRST")
  List<InLoteStockItemDTO> findLotesConStockByProductoAndAlmacen(
      @Param("productoId") Integer productoId,
      @Param("almacenId") Integer almacenId,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);

  /**
   * Productos activos que tienen al menos un registro de inventario en el almacén dado. Filtra
   * opcionalmente por nombre (búsqueda parcial, case-insensitive).
   */
  @Query(
      "SELECT DISTINCT new com.braintech.eFacturador.dto.producto.MgProductoResumenDTO("
          + "  p.id, p.nombreProducto) "
          + "FROM InInventario i JOIN i.productoId p "
          + "WHERE i.almacenId.id = :almacenId "
          + "AND i.empresaId = :empresaId "
          + "AND i.sucursalId.id = :sucursalId "
          + "AND p.activo = true "
          + "AND LOWER(p.nombreProducto) LIKE LOWER(CONCAT('%', COALESCE(:nombre, ''), '%')) "
          + "ORDER BY p.nombreProducto ASC")
  List<MgProductoResumenDTO> findProductosActivosByAlmacen(
      @Param("almacenId") Integer almacenId,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId,
      @Param("nombre") String nombre);
}
