package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InLoteResumenDTO;
import com.braintech.eFacturador.dto.inventario.InLoteSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InLote;
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
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InLoteDaoImpl implements InLoteDao {
  @PersistenceContext private EntityManager entityManager;

  @Override
  public Page<InLoteResumenDTO> searchByCriteria(
      InLoteSearchCriteria criteria, Integer empresaId, Integer sucursalId) {

    String select =
        "SELECT new com.braintech.eFacturador.dto.inventario.InLoteResumenDTO("
            + "l.lote, l.productoId.id, l.productoId.nombreProducto, "
            + "l.fechaVencimiento, l.estadoId, l.usuarioReg, l.fechaReg) ";

    String from = "FROM InLote l ";

    List<String> conditions = new ArrayList<>();
    conditions.add("l.empresaId = :empresaId");
    conditions.add("l.sucursalId.id = :sucursalId");

    if (criteria.getLote() != null && !criteria.getLote().isBlank()) {
      conditions.add("LOWER(l.lote) LIKE LOWER(CONCAT('%', :lote, '%'))");
    }
    if (criteria.getProductoId() != null) {
      conditions.add("l.productoId.id = :productoId");
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      conditions.add("l.estadoId = :estadoId");
    }

    String where = "WHERE " + String.join(" AND ", conditions);
    String orderBy = " ORDER BY l.fechaReg DESC";

    TypedQuery<InLoteResumenDTO> dataQuery =
        entityManager.createQuery(select + from + where + orderBy, InLoteResumenDTO.class);
    TypedQuery<Long> countQuery =
        entityManager.createQuery("SELECT COUNT(l) " + from + where, Long.class);

    dataQuery.setParameter("empresaId", empresaId);
    dataQuery.setParameter("sucursalId", sucursalId);
    countQuery.setParameter("empresaId", empresaId);
    countQuery.setParameter("sucursalId", sucursalId);

    if (criteria.getLote() != null && !criteria.getLote().isBlank()) {
      dataQuery.setParameter("lote", criteria.getLote());
      countQuery.setParameter("lote", criteria.getLote());
    }
    if (criteria.getProductoId() != null) {
      dataQuery.setParameter("productoId", criteria.getProductoId());
      countQuery.setParameter("productoId", criteria.getProductoId());
    }
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isBlank()) {
      dataQuery.setParameter("estadoId", criteria.getEstadoId());
      countQuery.setParameter("estadoId", criteria.getEstadoId());
    }

    PageRequest pageable = PageRequest.of(criteria.getPage(), criteria.getSize());
    dataQuery.setFirstResult((int) pageable.getOffset());
    dataQuery.setMaxResults(pageable.getPageSize());

    List<InLoteResumenDTO> content = dataQuery.getResultList();
    long total = countQuery.getSingleResult();

    return new PageImpl<>(content, pageable, total);
  }

  @Override
  @Transactional
  public InLote save(InLote lote) {
    // PK completo: lote + productoId + empresaId
    if (lote.getLote() == null || lote.getProductoId() == null || lote.getEmpresaId() == null) {
      entityManager.persist(lote);
      return lote;
    } else {
      return entityManager.merge(lote);
    }
  }

  @Override
  public Optional<InLote> findById(String lote, Long productoId, Integer empresaId) {
    List<InLote> result =
        entityManager
            .createQuery(
                "SELECT l FROM InLote l "
                    + "WHERE l.lote = :lote "
                    + "AND l.productoId.id = :productoId "
                    + "AND l.empresaId = :empresaId",
                InLote.class)
            .setParameter("lote", lote)
            .setParameter("productoId", productoId)
            .setParameter("empresaId", empresaId)
            .getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public Optional<InLote> findById(
      String lote, Long productoId, Integer empresaId, Integer sucursalId) {
    List<InLote> result =
        entityManager
            .createQuery(
                "SELECT l FROM InLote l "
                    + "WHERE l.lote = :lote "
                    + "AND l.productoId.id = :productoId "
                    + "AND l.empresaId = :empresaId "
                    + "AND l.sucursalId.id = :sucursalId",
                InLote.class)
            .setParameter("lote", lote)
            .setParameter("productoId", productoId)
            .setParameter("empresaId", empresaId)
            .setParameter("sucursalId", sucursalId)
            .getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public List<InLote> findAll(Integer empresaId) {
    return entityManager
        .createQuery("SELECT l FROM InLote l WHERE l.empresaId = :empresaId", InLote.class)
        .setParameter("empresaId", empresaId)
        .getResultList();
  }

  @Override
  public List<InLote> findAll(Integer empresaId, Integer sucursalId) {
    return entityManager
        .createQuery(
            "SELECT l FROM InLote l WHERE l.empresaId = :empresaId AND l.sucursalId.id = :sucursalId",
            InLote.class)
        .setParameter("empresaId", empresaId)
        .setParameter("sucursalId", sucursalId)
        .getResultList();
  }

  @Override
  @Transactional
  public void disableById(String lote, Long productoId, Integer empresaId) {
    Optional<InLote> loteOpt = findById(lote, productoId, empresaId);
    if (loteOpt.isPresent()) {
      InLote loteEntity = loteOpt.get();
      loteEntity.setEstadoId("INA");
      entityManager.merge(loteEntity);
    }
  }

  @Override
  @Transactional
  public void disableById(String lote, Long productoId, Integer empresaId, Integer sucursalId) {
    Optional<InLote> loteOpt = findById(lote, productoId, empresaId, sucursalId);
    if (loteOpt.isPresent()) {
      InLote loteEntity = loteOpt.get();
      loteEntity.setEstadoId("INA");
      entityManager.merge(loteEntity);
    }
  }
}
