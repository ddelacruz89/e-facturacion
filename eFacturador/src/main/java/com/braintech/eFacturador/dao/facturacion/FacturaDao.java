package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FacturaDao extends JpaRepository<MfFactura, Integer> {
  // MfFactura extends BaseDgII -> BaseSucursal - filter by empresaId AND sucursalId

  @Query("SELECT f FROM MfFactura f WHERE f.empresaId = :empresaId")
  List<MfFactura> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT f FROM MfFactura f WHERE f.empresaId = :empresaId AND f.sucursalId = :sucursalId")
  List<MfFactura> findAllByEmpresaIdAndSucursalId(
      @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);

  @Query(
      "SELECT f FROM MfFactura f WHERE f.empresaId = :empresaId AND f.sucursalId = :sucursalId AND f.estadoId = 'ACT'")
  List<MfFactura> findAllActiveByEmpresaIdAndSucursalId(
      @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);

  @Query("SELECT f FROM MfFactura f WHERE f.id = :id AND f.empresaId = :empresaId")
  Optional<MfFactura> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT f FROM MfFactura f WHERE f.id = :id AND f.empresaId = :empresaId AND f.sucursalId = :sucursalId")
  Optional<MfFactura> findByIdAndEmpresaIdAndSucursalId(
      @Param("id") Integer id,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);

  @Query(
      "SELECT f FROM MfFactura f WHERE f.numeroFactura = :numeroFactura AND f.empresaId = :empresaId AND f.sucursalId = :sucursalId")
  Optional<MfFactura> findByNumeroFacturaAndEmpresaIdAndSucursalId(
      @Param("numeroFactura") Integer numeroFactura,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);
}
