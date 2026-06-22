package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.dto.facturacion.ICotizacionResumen;
import com.braintech.eFacturador.jpa.facturacion.MfCotizacion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CotizacionDao extends JpaRepository<MfCotizacion, Integer> {

  @Query("SELECT f FROM MfCotizacion f WHERE f.empresaId = :empresaId")
  List<MfCotizacion> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT f FROM MfCotizacion f WHERE f.id = :id AND f.empresaId = :empresaId")
  Optional<MfCotizacion> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT f FROM MfCotizacion f WHERE f.secuencia = :secuencia AND f.empresaId = :empresaId AND f.sucursalId = :sucursalId")
  Optional<MfCotizacion> findBySecuenicaAndEmpresaIdAndSucursalId(
      @Param("secuencia") Integer secuencia,
      @Param("empresaId") Integer empresaId,
      @Param("sucursalId") Integer sucursalId);

  @Query("SELECT f FROM MfCotizacion f WHERE f.empresaId = :empresaId order by f.fechaReg desc")
  Page<ICotizacionResumen> findAllByEmpresaPage(Pageable pageable, Integer empresaId);
}
