package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidorLimiteAlmacen;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Acceso de lectura a {@code mg_producto_almacen_limite} para el sistema de alertas. La tabla
 * relaciona producto → unidad_suplidor → limite_almacen, por lo que el join requiere pasar por
 * {@code mg_producto_unidad_suplidor}.
 */
public interface InAlertaLimiteRepository
    extends JpaRepository<MgProductoUnidadSuplidorLimiteAlmacen, Integer> {

  /**
   * Devuelve el límite mínimo de stock configurado para un producto en un almacén. Usa native query
   * porque el join pasa por {@code mg_producto_unidad_suplidor} que no tiene un campo de navegación
   * directo desde la entidad límite.
   */
  @Query(
      value =
          """
          SELECT pal.limite
          FROM producto.mg_producto_almacen_limite pal
          JOIN producto.mg_producto_unidad_suplidor pus
            ON pus.id = pal.producto_unidad_suplidor_id
          WHERE pus.producto_id = :productoId
            AND pal.almacen_id  = :almacenId
            AND pal.empresa_id  = :empresaId
          LIMIT 1
          """,
      nativeQuery = true)
  Optional<Integer> findLimite(
      @Param("productoId") Integer productoId,
      @Param("almacenId") Integer almacenId,
      @Param("empresaId") Integer empresaId);
}
