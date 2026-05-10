package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InMovimientoTipoResumenDTO;
import com.braintech.eFacturador.jpa.inventario.InMovimientoTipo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Repositorio de solo lectura para el catálogo global de tipos de movimiento. */
public interface InMovimientoTipoRepository extends JpaRepository<InMovimientoTipo, Integer> {

  /** Filtra por cr: {@code true} = crédito (entrada), {@code false} = débito (salida). */
  List<InMovimientoTipo> findByCrOrderByTipoMovimientoAsc(Boolean cr);

  /**
   * Filtra por módulo. El campo {@code modulo} puede contener múltiples códigos separados por guión
   * (ej. {@code "AI-OE-OC"}). Se busca el código como segmento exacto envolviendo el campo con
   * guiones para evitar coincidencias parciales (ej. "AI" no coincide con "MAIN").
   */
  @Query(
      "SELECT t FROM InMovimientoTipo t "
          + "WHERE CONCAT('-', t.modulo, '-') LIKE CONCAT('%-', :modulo, '-%') "
          + "ORDER BY t.tipoMovimiento ASC")
  List<InMovimientoTipo> findByModulo(@Param("modulo") String modulo);

  /**
   * Búsqueda para el modal: proyecta solo id, tipoMovimiento, cr y modulo. Filtros opcionales: q
   * (nombre parcial) y cr (efecto stock).
   */
  @Query(
      "SELECT new com.braintech.eFacturador.dto.inventario.InMovimientoTipoResumenDTO("
          + "t.id, t.tipoMovimiento, t.cr, t.modulo) "
          + "FROM InMovimientoTipo t "
          + "WHERE (:q IS NULL OR LOWER(t.tipoMovimiento) LIKE LOWER(CONCAT('%', :q, '%'))) "
          + "AND (:cr IS NULL OR t.cr = :cr) "
          + "ORDER BY t.tipoMovimiento ASC")
  List<InMovimientoTipoResumenDTO> buscar(@Param("q") String q, @Param("cr") Boolean cr);
}
