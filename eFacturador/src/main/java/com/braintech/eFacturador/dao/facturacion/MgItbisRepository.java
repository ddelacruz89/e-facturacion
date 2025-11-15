package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.dto.facturacion.MgItbisSimpleDTO;
import com.braintech.eFacturador.jpa.general.MgItbis;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MgItbisRepository extends JpaRepository<MgItbis, Integer> {

  @Query("SELECT i FROM MgItbis i WHERE i.activo = true")
  List<MgItbis> findAllActive();

  @Query(
      "SELECT new com.braintech.eFacturador.dto.facturacion.MgItbisSimpleDTO(i.id, i.nombre) FROM MgItbis i WHERE i.activo = true")
  List<MgItbisSimpleDTO> findAllActiveSimple();
}
