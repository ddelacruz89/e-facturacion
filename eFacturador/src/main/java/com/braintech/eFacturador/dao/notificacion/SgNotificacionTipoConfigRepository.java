package com.braintech.eFacturador.dao.notificacion;

import com.braintech.eFacturador.jpa.notificacion.SgNotificacionTipoConfig;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SgNotificacionTipoConfigRepository
    extends JpaRepository<SgNotificacionTipoConfig, String> {

  List<SgNotificacionTipoConfig> findByActivoTrueOrderByModuloAscNombreAsc();

  @Query(
      "SELECT t.tipoId FROM SgNotificacionTipoConfig t WHERE t.activo = TRUE AND t.accesoRestringido = FALSE AND t.paraLogin = TRUE")
  Set<String> findTiposNoRestringidos();
}
