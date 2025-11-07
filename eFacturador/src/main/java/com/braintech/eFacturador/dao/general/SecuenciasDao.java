package com.braintech.eFacturador.dao.general;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
public class SecuenciasDao {

  @PersistenceContext private EntityManager entityManager;

  public int getNextSecuencia(int empresaId, String aplicacionId) {
    Integer nextNumero =
        (Integer)
            entityManager
                .createNativeQuery("SELECT general.get_next_secuencia(:empresaId, :aplicacionId)")
                .setParameter("empresaId", empresaId)
                .setParameter("aplicacionId", aplicacionId)
                .getSingleResult();

    return nextNumero != null ? nextNumero : 0;
  }
}
