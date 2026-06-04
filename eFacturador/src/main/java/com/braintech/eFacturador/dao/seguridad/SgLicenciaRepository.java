package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgLicencia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SgLicenciaRepository extends JpaRepository<SgLicencia, Integer> {

  Optional<SgLicencia> findByEmpresaId(Integer empresaId);

  List<SgLicencia> findAllByActivoTrue();
}
