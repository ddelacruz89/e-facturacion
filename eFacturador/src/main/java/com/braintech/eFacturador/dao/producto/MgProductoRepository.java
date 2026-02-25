package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.dto.producto.MgProductoResumenDTO;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgProductoRepository extends JpaRepository<MgProducto, Integer> {
  // MgProducto no extiende BaseEntity - es una entidad independiente sin multi-tenant
  // Sin embargo, tiene relaciones con entidades que sí filtran por empresa

  @Query("SELECT p FROM MgProducto p")
  List<MgProducto> findAll();

  @Query("SELECT p FROM MgProducto p WHERE p.id = :id")
  Optional<MgProducto> findById(@Param("id") Integer id);

  @Query("SELECT p FROM MgProducto p WHERE p.id = :id AND p.empresaId = :empresaId")
  Optional<MgProducto> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

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

  // Projection query: only id + nombre for the list endpoint (lightweight)
  @Query(
      "SELECT DISTINCT new com.braintech.eFacturador.dto.producto.MgProductoResumenDTO(p.id, p.nombreProducto) "
          + "FROM MgProducto p "
          + "JOIN p.unidadProductorSuplidor u "
          + "JOIN u.productosSuplidores s "
          + "WHERE p.empresaId = :empresaId "
          + "AND u.disponibleEnCompra = true "
          + "AND s.suplidorId.id = :suplidorId "
          + "AND (p.activo = true OR p.activo IS NULL) "
          + "AND (s.estadoId IS NULL OR s.estadoId <> 'INA')")
  List<MgProductoResumenDTO> findResumenDisponiblesCompraBySuplidorAndEmpresa(
      @Param("suplidorId") Integer suplidorId, @Param("empresaId") Integer empresaId);

  // Full entity fetch: single product with all its unidades disponibles en compra
  @Query(
      "SELECT DISTINCT p FROM MgProducto p "
          + "JOIN FETCH p.unidadProductorSuplidor u "
          + "WHERE p.id = :productoId "
          + "AND p.empresaId = :empresaId "
          + "AND u.disponibleEnCompra = true")
  Optional<MgProducto> findProductoCompraById(
      @Param("productoId") Integer productoId, @Param("empresaId") Integer empresaId);

  @Modifying
  @Query("UPDATE MgProducto p SET p.secuencia = :secuencia WHERE p.id = :id")
  void updateSecuencia(@Param("id") Integer id, @Param("secuencia") Integer secuencia);
}
