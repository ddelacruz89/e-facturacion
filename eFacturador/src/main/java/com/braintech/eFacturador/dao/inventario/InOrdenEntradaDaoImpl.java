package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
  public Optional<InOrdenEntrada> findById(Integer id) {
    InOrdenEntrada ordenEntrada = entityManager.find(InOrdenEntrada.class, id);
    return Optional.ofNullable(ordenEntrada);
  }

  @Override
  public List<InOrdenEntrada> findAll() {
    return entityManager
        .createQuery("SELECT o FROM InOrdenEntrada o", InOrdenEntrada.class)
        .getResultList();
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    Optional<InOrdenEntrada> ordenEntradaOpt = findById(id);
    if (ordenEntradaOpt.isPresent()) {
      InOrdenEntrada ordenEntrada = ordenEntradaOpt.get();
      ordenEntrada.setEstadoId("INA");
      entityManager.merge(ordenEntrada);
    }
  }
}
