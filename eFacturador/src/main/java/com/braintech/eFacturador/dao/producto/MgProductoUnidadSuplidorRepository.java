package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgProductoUnidadSuplidorRepository
    extends JpaRepository<MgProductoUnidadSuplidor, Integer> {
  // MgProductoUnidadSuplidor extends BaseEntity - filter by empresaId

  @Query("SELECT pus FROM MgProductoUnidadSuplidor pus WHERE pus.empresaId = :empresaId")
  List<MgProductoUnidadSuplidor> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query(
      "SELECT pus FROM MgProductoUnidadSuplidor pus WHERE pus.empresaId = :empresaId AND"
          + " pus.activo = true")
  List<MgProductoUnidadSuplidor> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query(
      "SELECT pus FROM MgProductoUnidadSuplidor pus WHERE pus.id = :id AND pus.empresaId ="
          + " :empresaId")
  Optional<MgProductoUnidadSuplidor> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT pus FROM MgProductoUnidadSuplidor pus WHERE pus.productoId.id = :productoId AND"
          + " pus.empresaId = :empresaId AND pus.activo = true")
  List<MgProductoUnidadSuplidor> findByProductoIdAndEmpresaId(
      @Param("productoId") Integer productoId, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT pus FROM MgProductoUnidadSuplidor pus WHERE pus.disponibleEnVenta = true AND"
          + " pus.empresaId = :empresaId AND pus.activo = true")
  List<MgProductoUnidadSuplidor> findAllAvailableForSale(@Param("empresaId") Integer empresaId);

  @Query(
      "SELECT pus FROM MgProductoUnidadSuplidor pus WHERE pus.disponibleEnCompra = true AND"
          + " pus.empresaId = :empresaId AND pus.activo = true")
  List<MgProductoUnidadSuplidor> findAllAvailableForPurchase(@Param("empresaId") Integer empresaId);
}
