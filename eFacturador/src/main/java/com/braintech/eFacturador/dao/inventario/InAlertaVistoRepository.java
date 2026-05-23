package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InAlertaVisto;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InAlertaVistoRepository extends JpaRepository<InAlertaVisto, Integer> {

  boolean existsByAlertaIdAndUsername(Integer alertaId, String username);

  /** IDs de alertas que el usuario ya vio — usado para resolver el flag visto en memoria. */
  @Query("SELECT v.alerta.id FROM InAlertaVisto v WHERE v.username = :username")
  Set<Integer> findAlertaIdsByUsername(@Param("username") String username);
}
