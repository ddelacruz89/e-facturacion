package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.dto.general.MgSubBarrioResumenDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class MgSubBarrioDaoImpl implements MgSubBarrioDao {

  @PersistenceContext private EntityManager em;

  @Override
  public List<MgSubBarrioResumenDTO> findByBarrio(Integer barrioId) {
    return em.createQuery(
            "SELECT new com.braintech.eFacturador.dto.general.MgSubBarrioResumenDTO("
                + "s.id, s.codSub, s.nombre, s.barrioId) "
                + "FROM MgSubBarrio s "
                + "WHERE s.barrioId = :barrioId "
                + "ORDER BY s.codSub ASC",
            MgSubBarrioResumenDTO.class)
        .setParameter("barrioId", barrioId)
        .getResultList();
  }
}
