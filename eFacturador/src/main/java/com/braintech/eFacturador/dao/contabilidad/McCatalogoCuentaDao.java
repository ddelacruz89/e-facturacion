package com.braintech.eFacturador.dao.contabilidad;

import com.braintech.eFacturador.jpa.contabilidad.McCatalogoCuenta;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface McCatalogoCuentaDao extends JpaRepository<McCatalogoCuenta, Integer> {

  @Query("SELECT c FROM McCatalogoCuenta c WHERE c.id = :id AND c.empresaId = :empresaId")
  Optional<McCatalogoCuenta> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  /** Nivel 1: cuentas sin padre (raíces del árbol), paginadas. */
  @Query(
      "SELECT c FROM McCatalogoCuenta c WHERE c.empresaId = :empresaId AND c.cuentaPadreId IS NULL "
          + "ORDER BY c.id ASC")
  Page<McCatalogoCuenta> findRaices(@Param("empresaId") Integer empresaId, Pageable pageable);

  /** Hijos directos de una cuenta — cargados lazy al expandir la fila en el frontend. */
  @Query(
      "SELECT c FROM McCatalogoCuenta c WHERE c.empresaId = :empresaId AND c.cuentaPadreId.id = :padreId "
          + "ORDER BY c.id ASC")
  List<McCatalogoCuenta> findHijos(
      @Param("empresaId") Integer empresaId, @Param("padreId") Integer padreId);

  /**
   * De la lista de ids dada, cuáles tienen al menos un hijo (para pintar la flecha de expandir).
   */
  @Query(
      "SELECT DISTINCT c.cuentaPadreId.id FROM McCatalogoCuenta c "
          + "WHERE c.empresaId = :empresaId AND c.cuentaPadreId.id IN :ids")
  List<Integer> findPadreIdsConHijos(
      @Param("empresaId") Integer empresaId, @Param("ids") List<Integer> ids);

  boolean existsByEmpresaIdAndCuenta(Integer empresaId, String cuenta);

  boolean existsByEmpresaIdAndCuentaAndIdNot(Integer empresaId, String cuenta, Integer id);
}
