package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InOrdenEntradaDaoImpl implements InOrdenEntradaDao {
  @PersistenceContext private EntityManager entityManager;

  @Override
  @Transactional
  public InOrdenEntrada save(InOrdenEntrada ordenEntrada) {
    if (ordenEntrada.getId() == null) {
      entityManager.persist(ordenEntrada);
      return ordenEntrada;
    } else {
      return entityManager.merge(ordenEntrada);
    }
  }

  @Override
  public Optional<InOrdenEntrada> findById(Integer id, Integer empresaId) {
    TypedQuery<InOrdenEntrada> query =
        entityManager.createQuery(
            "SELECT o FROM InOrdenEntrada o WHERE o.id = :id AND o.empresaId = :empresaId",
            InOrdenEntrada.class);
    query.setParameter("id", id);
    query.setParameter("empresaId", empresaId);
    List<InOrdenEntrada> result = query.getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public Optional<InOrdenEntrada> findById(Integer id, Integer empresaId, Integer sucursalId) {
    TypedQuery<InOrdenEntrada> query =
        entityManager.createQuery(
            "SELECT o FROM InOrdenEntrada o WHERE o.id = :id AND o.empresaId = :empresaId AND o.sucursalId.id = :sucursalId",
            InOrdenEntrada.class);
    query.setParameter("id", id);
    query.setParameter("empresaId", empresaId);
    query.setParameter("sucursalId", sucursalId);
    List<InOrdenEntrada> result = query.getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public List<InOrdenEntrada> findAll(Integer empresaId) {
    return entityManager
        .createQuery(
            "SELECT o FROM InOrdenEntrada o WHERE o.empresaId = :empresaId", InOrdenEntrada.class)
        .setParameter("empresaId", empresaId)
        .getResultList();
  }

  @Override
  public List<InOrdenEntrada> findAll(Integer empresaId, Integer sucursalId) {
    return entityManager
        .createQuery(
            "SELECT o FROM InOrdenEntrada o WHERE o.empresaId = :empresaId AND o.sucursalId.id = :sucursalId",
            InOrdenEntrada.class)
        .setParameter("empresaId", empresaId)
        .setParameter("sucursalId", sucursalId)
        .getResultList();
  }

  @Override
  @Transactional
  public void disableById(Integer id, Integer empresaId) {
    Optional<InOrdenEntrada> ordenEntradaOpt = findById(id, empresaId);
    if (ordenEntradaOpt.isPresent()) {
      InOrdenEntrada ordenEntrada = ordenEntradaOpt.get();
      ordenEntrada.setEstadoId("INA");
      entityManager.merge(ordenEntrada);
    }
  }

  @Override
  @Transactional
  public void disableById(Integer id, Integer empresaId, Integer sucursalId) {
    Optional<InOrdenEntrada> ordenEntradaOpt = findById(id, empresaId, sucursalId);
    if (ordenEntradaOpt.isPresent()) {
      InOrdenEntrada ordenEntrada = ordenEntradaOpt.get();
      ordenEntrada.setEstadoId("INA");
      entityManager.merge(ordenEntrada);
    }
  }
}
