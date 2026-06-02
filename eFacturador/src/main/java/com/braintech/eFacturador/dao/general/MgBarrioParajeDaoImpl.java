package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.dto.general.MgBarrioParajeResumenDTO;
import com.braintech.eFacturador.jpa.general.MgBarrioParaje;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class MgBarrioParajeDaoImpl implements MgBarrioParajeDao {

  @PersistenceContext private EntityManager em;

  @Override
  public Optional<MgBarrioParaje> findById(Integer id) {
    List<MgBarrioParaje> r =
        em.createQuery("SELECT b FROM MgBarrioParaje b WHERE b.id = :id", MgBarrioParaje.class)
            .setParameter("id", id)
            .getResultList();
    return r.isEmpty() ? Optional.empty() : Optional.of(r.get(0));
  }

  @Override
  public List<MgBarrioParajeResumenDTO> findByMunicipio(Integer municipioId) {
    // Los barrios pertenecen a secciones; las secciones pertenecen al municipio.
    // Subquery JPQL para resolver municipioId → secciones → barrios.
    return em.createQuery(
            "SELECT new com.braintech.eFacturador.dto.general.MgBarrioParajeResumenDTO("
                + "b.id, b.nombre, b.seccionId, b.precioEnvio) "
                + "FROM MgBarrioParaje b "
                + "WHERE b.seccionId IN ("
                + "  SELECT s.id FROM MgSeccion s WHERE s.municipioId = :municipioId"
                + ") "
                + "ORDER BY b.nombre ASC",
            MgBarrioParajeResumenDTO.class)
        .setParameter("municipioId", municipioId)
        .getResultList();
  }
}
