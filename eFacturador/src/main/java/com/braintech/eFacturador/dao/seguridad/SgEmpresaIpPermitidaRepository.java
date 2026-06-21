package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgEmpresaIpPermitida;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SgEmpresaIpPermitidaRepository
    extends JpaRepository<SgEmpresaIpPermitida, Integer> {

  List<SgEmpresaIpPermitida> findByEmpresaIdOrderByFechaRegDesc(Integer empresaId);

  Optional<SgEmpresaIpPermitida> findByIdAndEmpresaId(Integer id, Integer empresaId);

  /** ¿Tiene la empresa al menos una IP activa configurada? */
  boolean existsByEmpresaIdAndActivoTrue(Integer empresaId);

  /** ¿Está esta IP exacta en la lista activa de la empresa? */
  boolean existsByEmpresaIdAndIpOrigenAndActivoTrue(Integer empresaId, String ipOrigen);
}
