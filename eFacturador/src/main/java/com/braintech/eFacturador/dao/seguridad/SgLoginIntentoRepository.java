package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgLoginIntento;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SgLoginIntentoRepository extends JpaRepository<SgLoginIntento, Long> {

  @Query(
      """
      SELECT COUNT(i) FROM SgLoginIntento i
      WHERE i.username = :username
        AND i.motivoRechazo = 'CONTRASENA_INCORRECTA'
        AND i.fechaIntento >= :desde
      """)
  long countFallosRecientes(
      @Param("username") String username, @Param("desde") LocalDateTime desde);
}
