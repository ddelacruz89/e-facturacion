package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgLicenciaModulo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SgLicenciaModuloRepository extends JpaRepository<SgLicenciaModulo, Integer> {

  List<SgLicenciaModulo> findByEmpresaIdAndActivoTrue(Integer empresaId);

  Optional<SgLicenciaModulo> findByEmpresaIdAndModuloId(Integer empresaId, String moduloId);

  boolean existsByEmpresaIdAndModuloIdAndActivoTrue(Integer empresaId, String moduloId);
}
