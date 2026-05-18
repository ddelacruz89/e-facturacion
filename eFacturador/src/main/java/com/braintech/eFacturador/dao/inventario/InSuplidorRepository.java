package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InSuplidorResumenDTO;
import com.braintech.eFacturador.dto.inventario.InSuplidorSimpleDTO;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InSuplidorRepository extends JpaRepository<InSuplidor, Integer> {

  @Query("SELECT s FROM InSuplidor s WHERE s.empresaId = :empresaId")
  List<InSuplidor> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT s FROM InSuplidor s WHERE s.empresaId = :empresaId AND s.activo = true")
  List<InSuplidor> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT s FROM InSuplidor s WHERE s.id = :id AND s.empresaId = :empresaId")
  Optional<InSuplidor> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  @Query("SELECT s FROM InSuplidor s WHERE s.rnc = :rnc AND s.empresaId = :empresaId")
  Optional<InSuplidor> findByRncAndEmpresaId(
      @Param("rnc") String rnc, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT new com.braintech.eFacturador.dto.inventario.InSuplidorSimpleDTO(s.id, s.nombre, s.rnc) FROM InSuplidor s WHERE s.empresaId = :empresaId AND s.activo = true")
  List<InSuplidorSimpleDTO> findAllActiveSimpleByEmpresaId(@Param("empresaId") Integer empresaId);

  /**
   * Búsqueda paginada con filtros opcionales. Pasar "" para omitir un filtro; NUNCA null (causa
   * error bytea en Hibernate 6 + PostgreSQL).
   */
  @Query(
      "SELECT new com.braintech.eFacturador.dto.inventario.InSuplidorResumenDTO("
          + "s.id, s.nombre, s.rnc, s.telefono1, s.estadoId, s.activo, s.usuarioReg,"
          + " s.tipoComprobante.id, s.tipoComprobante.tipoComprobante) "
          + "FROM InSuplidor s "
          + "WHERE s.empresaId = :empresaId "
          + "  AND (:nombre            = '' OR LOWER(s.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) "
          + "  AND (:rnc               = '' OR s.rnc LIKE CONCAT('%', :rnc, '%')) "
          + "  AND (:tipoComprobanteId = '' OR s.tipoComprobante.id = :tipoComprobanteId)")
  Page<InSuplidorResumenDTO> buscar(
      @Param("empresaId") Integer empresaId,
      @Param("nombre") String nombre,
      @Param("rnc") String rnc,
      @Param("tipoComprobanteId") String tipoComprobanteId,
      Pageable pageable);
}
