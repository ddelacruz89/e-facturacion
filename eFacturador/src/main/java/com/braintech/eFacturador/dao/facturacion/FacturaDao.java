package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.dto.facturacion.IFacturaResumen;
import com.braintech.eFacturador.dto.facturacion.MfFacturaParaDespachoDTO;
import com.braintech.eFacturador.dto.facturacion.PrecioVentaDto;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

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
      "SELECT f FROM MfFactura f WHERE f.secuencia = :numeroFactura AND f.empresaId = :empresaId AND f.sucursalId = :sucursalId")
  Optional<MfFactura> findByNumeroFacturaAndEmpresaIdAndSucursalId(
      @Param("numeroFactura") Integer numeroFactura,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);

  @Query(
      """
            select new com.braintech.eFacturador.dto.facturacion.PrecioVentaDto(p.id, p.secuencia,p.codigoBarra,p.nombreProducto,p.descripcion,p.itbisId,p.precioVenta,p.precioCostoAvg) from MgProducto p where p.activo=true
            """)
  List<PrecioVentaDto> findProductoVenta();

  @Query("SELECT f FROM MfFactura f WHERE f.empresaId = :empresaId order by f.fechaReg desc")
  Page<IFacturaResumen> findAllByEmpresaPage(Pageable pageable, Integer empresaId);

  @Query(
      """
      SELECT new com.braintech.eFacturador.dto.facturacion.MfFacturaParaDespachoDTO(
          f.id, f.secuencia, f.razonSocial, f.clienteId, f.total, f.fechaReg)
      FROM MfFactura f
      WHERE f.empresaId = :empresaId
        AND f.sucursalId = :sucursalId
        AND f.estadoId = 'PAG'
        AND f.envio = true
        AND NOT EXISTS (
            SELECT o FROM DeOrdenDespacho o
            WHERE o.facturaId = f.id
              AND o.empresaId = :empresaId
              AND o.estadoId <> 'ANU')
      ORDER BY f.fechaReg DESC
      """)
  List<MfFacturaParaDespachoDTO> findFacturasParaDespacho(
      @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);

  @Transactional
  @Modifying(clearAutomatically = true)
  @Query(
      """
            update MfFactura f set f.fechaFirma = :fechaFirma,f.secuityCode= :secuityCode, f.qrUrl = :qrUrl , f.trackId = :trackId where f.id = :id and f.empresaId = :empresaId
            """)
  void updateFirmaAndQr(
      @Param("id") Integer id,
      @Param("empresaId") Integer empresaId,
      @Param("fechaFirma") String fechaFirma,
      @Param("secuityCode") String secuityCode,
      @Param("qrUrl") String qrUrl,
      @Param("trackId") String trackId);
}
