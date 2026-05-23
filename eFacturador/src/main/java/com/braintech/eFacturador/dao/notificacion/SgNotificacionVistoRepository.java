package com.braintech.eFacturador.dao.notificacion;

import com.braintech.eFacturador.jpa.notificacion.SgNotificacionVisto;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgNotificacionVistoRepository extends JpaRepository<SgNotificacionVisto, Integer> {

  boolean existsByNotificacionIdAndUsername(Integer notificacionId, String username);

  /** IDs de notificaciones ya vistas por el usuario — para resolver el flag en memoria. */
  @Query("SELECT v.notificacion.id FROM SgNotificacionVisto v WHERE v.username = :username")
  Set<Integer> findNotificacionIdsByUsername(@Param("username") String username);
}
