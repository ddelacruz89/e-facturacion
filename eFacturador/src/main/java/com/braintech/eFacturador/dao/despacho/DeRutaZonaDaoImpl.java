package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.dto.despacho.DeRutaZonaResumenDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class DeRutaZonaDaoImpl {

  @PersistenceContext private EntityManager entityManager;

  public List<DeRutaZonaResumenDTO> findZonasConNombres(Integer rutaId) {
    String jpql =
        "SELECT new com.braintech.eFacturador.dto.despacho.DeRutaZonaResumenDTO("
            + "z.id, z.rutaId, z.codProvincia, "
            + "(SELECT p.nombre FROM MgProvincia p WHERE p.codProvincia = z.codProvincia), "
            + "z.municipioId, "
            + "(SELECT m.nombre FROM MgMunicipio m WHERE m.id = z.municipioId), "
            + "z.barrioId, "
            + "(SELECT b.nombre FROM MgBarrioParaje b WHERE b.id = z.barrioId)"
            + ") "
            + "FROM DeRutaZona z WHERE z.rutaId = :rutaId "
            + "ORDER BY z.codProvincia, z.municipioId, z.barrioId";

    return entityManager
        .createQuery(jpql, DeRutaZonaResumenDTO.class)
        .setParameter("rutaId", rutaId)
        .getResultList();
  }
}
