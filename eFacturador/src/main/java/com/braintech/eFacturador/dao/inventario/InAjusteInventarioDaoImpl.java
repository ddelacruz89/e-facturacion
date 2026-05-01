package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InAjusteInventarioDaoImpl implements InAjusteInventarioDao {

  @PersistenceContext private EntityManager em;

  @Override
  @Transactional
  public InAjusteInventario save(InAjusteInventario ajuste) {
    if (ajuste.getId() == null) {
      em.persist(ajuste);
      return ajuste;
    }
    return em.merge(ajuste);
  }

  @Override
  public Optional<InAjusteInventario> findById(Integer id, Integer empresaId, Integer sucursalId) {
    List<InAjusteInventario> result =
        em.createQuery(
                "SELECT a FROM InAjusteInventario a "
                    + "WHERE a.id = :id AND a.empresaId = :empresaId AND a.sucursalId.id = :sucursalId",
                InAjusteInventario.class)
            .setParameter("id", id)
            .setParameter("empresaId", empresaId)
            .setParameter("sucursalId", sucursalId)
            .getResultList();
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

  @Override
  public List<InAjusteInventarioResumenDTO> findByAlmacen(
      Integer almacenId, Integer empresaId, Integer sucursalId) {
    return em.createQuery(
            "SELECT new com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO("
                + "  a.id, a.fechaReg, a.almacenId, a.estadoId, a.observacion, a.usuarioReg,"
                + "  SIZE(a.detalles)"
                + ") FROM InAjusteInventario a "
                + "WHERE a.almacenId = :almacenId "
                + "  AND a.empresaId = :empresaId "
                + "  AND a.sucursalId.id = :sucursalId "
                + "ORDER BY a.fechaReg DESC",
            InAjusteInventarioResumenDTO.class)
        .setParameter("almacenId", almacenId)
        .setParameter("empresaId", empresaId)
        .setParameter("sucursalId", sucursalId)
        .getResultList();
  }
}
