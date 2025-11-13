package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.jpa.producto.MgProducto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgProductoRepository extends JpaRepository<MgProducto, Integer> {
  // MgProducto no extiende BaseEntity - es una entidad independiente sin multi-tenant
  // Sin embargo, tiene relaciones con entidades que sí filtran por empresa

  @Query("SELECT p FROM MgProducto p")
  List<MgProducto> findAll();

  @Query("SELECT p FROM MgProducto p WHERE p.id = :id")
  Optional<MgProducto> findById(@Param("id") Integer id);

  @Query("SELECT p FROM MgProducto p WHERE p.codigoBarra = :codigoBarra")
  Optional<MgProducto> findByCodigoBarra(@Param("codigoBarra") String codigoBarra);

  @Query("SELECT p FROM MgProducto p WHERE p.nombreProducto LIKE %:nombre%")
  List<MgProducto> findByNombreContaining(@Param("nombre") String nombre);

  @Query("SELECT p FROM MgProducto p WHERE p.categoriaId.id = :categoriaId")
  List<MgProducto> findByCategoriaId(@Param("categoriaId") Integer categoriaId);

  @Query(
      "SELECT DISTINCT p FROM MgProducto p JOIN p.unidadProductorSuplidor u WHERE"
          + " u.disponibleEnVenta = true")
  List<MgProducto> findAllAvailableForSale();

  @Query("SELECT p FROM MgProducto p WHERE p.trabajador = true")
  List<MgProducto> findAllWorkerProducts();
}
