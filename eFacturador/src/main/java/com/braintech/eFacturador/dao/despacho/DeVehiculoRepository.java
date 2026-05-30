package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.jpa.despacho.DeVehiculo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DeVehiculoRepository extends JpaRepository<DeVehiculo, Integer> {

  @Query(
      "SELECT v FROM DeVehiculo v WHERE v.empresaId = :empresaId AND v.activo = true ORDER BY v.descripcion ASC")
  List<DeVehiculo> findAllActivosByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT v FROM DeVehiculo v WHERE v.empresaId = :empresaId ORDER BY v.descripcion ASC")
  List<DeVehiculo> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT v FROM DeVehiculo v WHERE v.id = :id AND v.empresaId = :empresaId")
  Optional<DeVehiculo> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);
}
