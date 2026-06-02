package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.dto.general.MgMunicipioResumenDTO;
import com.braintech.eFacturador.dto.general.MgMunicipioSearchCriteria;
import com.braintech.eFacturador.jpa.general.MgMunicipio;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

@Repository
public class MgMunicipioDaoImpl implements MgMunicipioDao {

  @PersistenceContext private EntityManager em;

  @Override
  public Optional<MgMunicipio> findById(Integer id) {
    List<MgMunicipio> r =
        em.createQuery("SELECT m FROM MgMunicipio m WHERE m.id = :id", MgMunicipio.class)
            .setParameter("id", id)
            .getResultList();
    return r.isEmpty() ? Optional.empty() : Optional.of(r.get(0));
  }

  @Override
  public List<MgMunicipioResumenDTO> findByProvincia(String codProvincia) {
    return em.createQuery(
            "SELECT new com.braintech.eFacturador.dto.general.MgMunicipioResumenDTO("
                + "m.id, m.codOne, m.nombre, m.codProvincia, m.parentId, m.esDm) "
                + "FROM MgMunicipio m "
                + "WHERE m.codProvincia = :cod "
                + "ORDER BY m.esDm ASC, m.nombre ASC",
            MgMunicipioResumenDTO.class)
        .setParameter("cod", codProvincia)
        .getResultList();
  }

  @Override
  public Page<MgMunicipioResumenDTO> searchByCriteria(MgMunicipioSearchCriteria criteria) {
    List<String> conditions = new ArrayList<>();

    if (criteria.getCodProvincia() != null && !criteria.getCodProvincia().isBlank())
      conditions.add("m.codProvincia = :codProvincia");
    if (criteria.getNombre() != null && !criteria.getNombre().isBlank())
      conditions.add("UPPER(m.nombre) LIKE UPPER(CONCAT('%', :nombre, '%'))");
    if (criteria.getEsDm() != null) conditions.add("m.esDm = :esDm");
    if (criteria.getParentId() != null) conditions.add("m.parentId = :parentId");

    String where = conditions.isEmpty() ? "" : "WHERE " + String.join(" AND ", conditions);
    String select =
        "SELECT new com.braintech.eFacturador.dto.general.MgMunicipioResumenDTO("
            + "m.id, m.codOne, m.nombre, m.codProvincia, m.parentId, m.esDm) ";
    String jpql = select + "FROM MgMunicipio m " + where + " ORDER BY m.nombre ASC";
    String countJpql = "SELECT COUNT(m) FROM MgMunicipio m " + where;

    TypedQuery<MgMunicipioResumenDTO> q = em.createQuery(jpql, MgMunicipioResumenDTO.class);
    TypedQuery<Long> countQ = em.createQuery(countJpql, Long.class);

    if (criteria.getCodProvincia() != null && !criteria.getCodProvincia().isBlank()) {
      q.setParameter("codProvincia", criteria.getCodProvincia());
      countQ.setParameter("codProvincia", criteria.getCodProvincia());
    }
    if (criteria.getNombre() != null && !criteria.getNombre().isBlank()) {
      q.setParameter("nombre", criteria.getNombre());
      countQ.setParameter("nombre", criteria.getNombre());
    }
    if (criteria.getEsDm() != null) {
      q.setParameter("esDm", criteria.getEsDm());
      countQ.setParameter("esDm", criteria.getEsDm());
    }
    if (criteria.getParentId() != null) {
      q.setParameter("parentId", criteria.getParentId());
      countQ.setParameter("parentId", criteria.getParentId());
    }

    int page = criteria.getPage() != null ? criteria.getPage() : 0;
    int size = criteria.getSize() != null ? criteria.getSize() : 50;
    q.setFirstResult(page * size).setMaxResults(size);

    return new PageImpl<>(q.getResultList(), PageRequest.of(page, size), countQ.getSingleResult());
  }
}
