package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.dto.inventario.InSuplidorProductoView;
import com.braintech.eFacturador.jpa.producto.MgProductoSuplidor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgProductoSuplidorRepository extends JpaRepository<MgProductoSuplidor, Integer> {

  /**
   * Obtiene los productos asociados a un suplidor, incluyendo nombre del producto, navegando por la
   * tabla mg_producto_unidad_suplidor.
   */
  @Query(
      value =
          "SELECT mps.id                    AS id, "
              + "       mpus.producto_id     AS productoId, "
              + "       mp.nombre_producto   AS productoNombre, "
              + "       mps.precio           AS precio, "
              + "       mps.estado_id        AS estadoId "
              + "FROM   producto.mg_producto_suplidor        mps "
              + "INNER  JOIN producto.mg_producto_unidad_suplidor mpus ON mpus.id = mps.producto_suplidor_id "
              + "INNER  JOIN producto.mg_producto             mp   ON mp.id  = mpus.producto_id "
              + "WHERE  mps.suplidor_id  = :suplidorId "
              + "  AND  mps.empresa_id   = :empresaId "
              + "  AND  mps.activo       = true",
      nativeQuery = true)
  List<InSuplidorProductoView> findProductosBySuplidor(
      @Param("suplidorId") Integer suplidorId, @Param("empresaId") Integer empresaId);

  /**
   * Inserta un registro en mg_producto_suplidor usando el primer mg_producto_unidad_suplidor activo
   * del producto. Retorna el número de filas afectadas (0 = producto sin unidad configurada).
   */
  @Modifying
  @Query(
      value =
          "INSERT INTO producto.mg_producto_suplidor "
              + "(empresa_id, suplidor_id, precio, itbis_default, estado_id, activo, usuario_reg, fecha_reg, producto_suplidor_id) "
              + "VALUES ( "
              + "  :empresaId, :suplidorId, :precio, false, 'A', true, :username, NOW(), "
              + "  (SELECT id FROM producto.mg_producto_unidad_suplidor "
              + "   WHERE producto_id = :productoId AND empresa_id = :empresaId AND activo = true "
              + "   LIMIT 1) "
              + ")",
      nativeQuery = true)
  int addProductoToSuplidor(
      @Param("empresaId") Integer empresaId,
      @Param("suplidorId") Integer suplidorId,
      @Param("productoId") Integer productoId,
      @Param("precio") BigDecimal precio,
      @Param("username") String username);

  /** Verifica si el producto ya está asociado al suplidor (evitar duplicados). */
  @Query(
      value =
          "SELECT COUNT(*) > 0 "
              + "FROM   producto.mg_producto_suplidor mps "
              + "INNER  JOIN producto.mg_producto_unidad_suplidor mpus ON mpus.id = mps.producto_suplidor_id "
              + "WHERE  mps.suplidor_id  = :suplidorId "
              + "  AND  mps.empresa_id   = :empresaId "
              + "  AND  mpus.producto_id = :productoId "
              + "  AND  mps.activo       = true",
      nativeQuery = true)
  boolean existeProductoEnSuplidor(
      @Param("suplidorId") Integer suplidorId,
      @Param("empresaId") Integer empresaId,
      @Param("productoId") Integer productoId);

  /** Actualiza el precio de un producto-suplidor. */
  @Modifying
  @Query(
      value =
          "UPDATE producto.mg_producto_suplidor "
              + "SET precio = :precio "
              + "WHERE id = :id AND empresa_id = :empresaId AND suplidor_id = :suplidorId",
      nativeQuery = true)
  int updatePrecio(
      @Param("id") Integer id,
      @Param("precio") BigDecimal precio,
      @Param("empresaId") Integer empresaId,
      @Param("suplidorId") Integer suplidorId);

  /** Desactiva (soft-delete) un producto-suplidor. */
  @Modifying
  @Query(
      value =
          "UPDATE producto.mg_producto_suplidor "
              + "SET activo = false "
              + "WHERE id = :id AND empresa_id = :empresaId AND suplidor_id = :suplidorId",
      nativeQuery = true)
  int removeProducto(
      @Param("id") Integer id,
      @Param("empresaId") Integer empresaId,
      @Param("suplidorId") Integer suplidorId);

  @Query("SELECT mps FROM MgProductoSuplidor mps WHERE mps.id = :id AND mps.empresaId = :empresaId")
  Optional<MgProductoSuplidor> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);
}
