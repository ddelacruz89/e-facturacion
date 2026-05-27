package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgRecuperacionToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SgRecuperacionTokenRepository extends JpaRepository<SgRecuperacionToken, Long> {

  @Query(
      """
      SELECT t FROM SgRecuperacionToken t
      WHERE t.loginEmail = :email
        AND t.codigo = :codigo
        AND t.usado = false
        AND t.expiracion > CURRENT_TIMESTAMP
      ORDER BY t.fechaReg DESC
      """)
  Optional<SgRecuperacionToken> findTokenValido(
      @Param("email") String email, @Param("codigo") String codigo);

  @Modifying
  @Transactional
  @Query("UPDATE SgRecuperacionToken t SET t.usado = true WHERE t.loginEmail = :email")
  void invalidarTokensDeEmail(@Param("email") String email);
}
