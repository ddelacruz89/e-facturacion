package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InLote;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InLoteDaoImpl implements InLoteDao {
  @PersistenceContext private EntityManager entityManager;

  @Override
  @Transactional
  public InLote save(InLote lote) {
    if (lote.getLote() == null || lote.getProductoId() == null) {
      entityManager.persist(lote);
      return lote;
    } else {
      return entityManager.merge(lote);
    }
  }

  @Override
  public Optional<InLote> findById(String lote, Long productoId, Integer empresaId) {
    TypedQuery<InLote> query =
        entityManager.createQuery(
            "SELECT l FROM InLote l WHERE l.lote = :lote AND l.productoId.id = :productoId AND l.empresaId = :empresaId",
            InLote.class);
    query.setParameter("lote", lote);
    query.setParameter("productoId", productoId);
    query.setParameter("empresaId", empresaId);
    List<InLote> result = query.getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public Optional<InLote> findById(
      String lote, Long productoId, Integer empresaId, Integer sucursalId) {
    TypedQuery<InLote> query =
        entityManager.createQuery(
            "SELECT l FROM InLote l WHERE l.lote = :lote AND l.productoId.id = :productoId AND l.empresaId = :empresaId AND l.sucursalId.id = :sucursalId",
            InLote.class);
    query.setParameter("lote", lote);
    query.setParameter("productoId", productoId);
    query.setParameter("empresaId", empresaId);
    query.setParameter("sucursalId", sucursalId);
    List<InLote> result = query.getResultList();
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
