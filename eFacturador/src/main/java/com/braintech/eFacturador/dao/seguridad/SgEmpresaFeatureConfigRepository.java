package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgEmpresaFeatureConfig;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SgEmpresaFeatureConfigRepository
    extends JpaRepository<SgEmpresaFeatureConfig, Integer> {

  Optional<SgEmpresaFeatureConfig> findByEmpresaIdAndFeatureId(Integer empresaId, String featureId);

  List<SgEmpresaFeatureConfig> findAllByEmpresaId(Integer empresaId);
}
