package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgModulo;
import com.braintech.eFacturador.jpa.seguridad.dto.ModuloDto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ModuloDao extends JpaRepository<SgModulo, String> {
  @Query("select m from SgModulo m")
  List<ModuloDto> getModulos();
}
