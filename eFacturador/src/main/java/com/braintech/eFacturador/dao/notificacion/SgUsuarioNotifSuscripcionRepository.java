package com.braintech.eFacturador.dao.notificacion;

import com.braintech.eFacturador.jpa.notificacion.SgUsuarioNotifSuscripcion;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgUsuarioNotifSuscripcionRepository
    extends JpaRepository<SgUsuarioNotifSuscripcion, Integer> {

  List<SgUsuarioNotifSuscripcion> findByEmpresaIdAndUsername(Integer empresaId, String username);

  @Query(
      "SELECT s.tipoId FROM SgUsuarioNotifSuscripcion s WHERE s.empresaId = :empresaId AND s.username = :username")
  Set<String> findTipoIdsByEmpresaIdAndUsername(
      @Param("empresaId") Integer empresaId, @Param("username") String username);

  @Modifying
  @Query(
      "DELETE FROM SgUsuarioNotifSuscripcion s WHERE s.empresaId = :empresaId AND s.username = :username")
  void deleteAllByEmpresaIdAndUsername(
      @Param("empresaId") Integer empresaId, @Param("username") String username);
}
