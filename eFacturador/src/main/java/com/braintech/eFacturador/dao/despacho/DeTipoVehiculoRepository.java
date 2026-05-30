package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.jpa.despacho.DeTipoVehiculo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeTipoVehiculoRepository extends JpaRepository<DeTipoVehiculo, Integer> {
  List<DeTipoVehiculo> findAllByEmpresaId(Integer empresaId);

  List<DeTipoVehiculo> findAllByEmpresaIdAndActivoTrue(Integer empresaId);

  Optional<DeTipoVehiculo> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
