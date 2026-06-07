package com.braintech.eFacturador.dao.notificacion;

import com.braintech.eFacturador.jpa.notificacion.SgNotificacionDestinatario;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgNotificacionDestinatarioRepository
    extends JpaRepository<SgNotificacionDestinatario, Integer> {

  List<SgNotificacionDestinatario> findByNotificacionId(Integer notificacionId);

  boolean existsByNotificacionIdAndUsername(Integer notificacionId, String username);

  @Modifying
  @Query("DELETE FROM SgNotificacionDestinatario d WHERE d.notificacion.id = :notificacionId AND d.username = :username")
  void deleteByNotificacionIdAndUsername(
      @Param("notificacionId") Integer notificacionId, @Param("username") String username);
}
