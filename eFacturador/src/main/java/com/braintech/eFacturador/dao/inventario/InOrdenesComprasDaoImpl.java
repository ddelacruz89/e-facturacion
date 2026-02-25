package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InOrdenesComprasResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InOrdenesCompras;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public class InOrdenesComprasDaoImpl implements InOrdenesComprasDao {

  private static final Logger log = LoggerFactory.getLogger(InOrdenesComprasDaoImpl.class);

  @PersistenceContext private EntityManager entityManager;

  @Override
  public Page<InOrdenesComprasResumenDTO> searchByCriteria(
      InOrdenesComprasSearchCriteria criteria, Integer empresaId) {

    log.info("=== BÚSQUEDA DE ÓRDENES DE COMPRA (RESUMEN) ===");
    log.info("Criterios recibidos: {}", criteria);
    log.info("EmpresaId: {}", empresaId);

    CriteriaBuilder cb = entityManager.getCriteriaBuilder();

    // Query principal - PROJECTION para traer solo campos del resumen
    CriteriaQuery<InOrdenesComprasResumenDTO> query =
        cb.createQuery(InOrdenesComprasResumenDTO.class);
    Root<InOrdenesCompras> root = query.from(InOrdenesCompras.class);

    // Construir la projection del DTO
    query.select(
        cb.construct(
            InOrdenesComprasResumenDTO.class,
            root.get("id"),
            root.get("total"),
            root.get("suplidorId").get("nombre"),
            root.get("suplidorId").get("rnc"),
            root.get("estadoId"),
            root.get("fechaReg")));

    List<Predicate> predicates = buildPredicates(cb, root, criteria, empresaId);

    log.info("Número de predicados aplicados: {}", predicates.size());

    query.where(predicates.toArray(new Predicate[0]));
    query.orderBy(cb.desc(root.get("fechaReg")));

    // Paginación
    int page = criteria.getPage() != null ? criteria.getPage() : 0;
    int size = criteria.getSize() != null ? criteria.getSize() : 10;
    Pageable pageable = PageRequest.of(page, size);

    TypedQuery<InOrdenesComprasResumenDTO> typedQuery = entityManager.createQuery(query);
    typedQuery.setFirstResult((int) pageable.getOffset());
    typedQuery.setMaxResults(pageable.getPageSize());

    log.info(
        "Ejecutando query de resumen con offset={} y maxResults={}",
        pageable.getOffset(),
        pageable.getPageSize());

    List<InOrdenesComprasResumenDTO> resultList = typedQuery.getResultList();

    log.info("Resultados encontrados: {}", resultList.size());

    // Count query - OPCIONAL para mejor performance
    Long total;

    if (criteria.getIncludeCount() != null && !criteria.getIncludeCount()) {
      // No ejecutar count - usar un valor estimado o -1 para indicar "desconocido"
      total = -1L;
      log.info("Count query OMITIDO por request del cliente (mejor performance)");
    } else if (resultList.size() < pageable.getPageSize()) {
      // Optimización: Si trajimos menos resultados que el page size,
      // significa que estamos en la última página
      total = (long) (pageable.getOffset() + resultList.size());
      log.info("Total calculado sin count query (última página): {}", total);
    } else {
      // Ejecutar count solo si es necesario
      CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
      Root<InOrdenesCompras> countRoot = countQuery.from(InOrdenesCompras.class);
      List<Predicate> countPredicates = buildPredicates(cb, countRoot, criteria, empresaId);

      countQuery.select(cb.count(countRoot));
      countQuery.where(countPredicates.toArray(new Predicate[0]));

      log.info("Ejecutando count query...");
      total = entityManager.createQuery(countQuery).getSingleResult();
      log.info("Total de registros: {}", total);
    }

    log.info("=== FIN BÚSQUEDA ===");

    return new PageImpl<>(resultList, pageable, total);
  }

  private List<Predicate> buildPredicates(
      CriteriaBuilder cb,
      Root<InOrdenesCompras> root,
      InOrdenesComprasSearchCriteria criteria,
      Integer empresaId) {
    List<Predicate> predicates = new ArrayList<>();

    // Filtro por empresa (multi-tenant) - MANDATORIO
    predicates.add(cb.equal(root.get("suplidorId").get("empresaId"), empresaId));
    log.debug("  + Filtro por empresaId: {}", empresaId);

    // Si se busca por ID específico, las fechas son opcionales
    boolean searchingById = criteria.getId() != null;

    // Filtro por fechas - MANDATORIO (excepto cuando se busca por ID)
    if (!searchingById) {
      if (criteria.getFechaInicio() != null && criteria.getFechaFin() != null) {
        LocalDateTime fechaInicioDateTime = criteria.getFechaInicio().atStartOfDay();
        LocalDateTime fechaFinDateTime = criteria.getFechaFin().atTime(LocalTime.MAX);

        predicates.add(cb.greaterThanOrEqualTo(root.get("fechaReg"), fechaInicioDateTime));
        predicates.add(cb.lessThanOrEqualTo(root.get("fechaReg"), fechaFinDateTime));
        log.debug("  + Filtro por fechas: {} - {}", fechaInicioDateTime, fechaFinDateTime);
      } else {
        // Si no se proporcionan fechas, usar el mes actual por defecto
        LocalDate now = LocalDate.now();
        LocalDate primerDiaMes = now.withDayOfMonth(1);
        LocalDate ultimoDiaMes = now.withDayOfMonth(now.lengthOfMonth());

        LocalDateTime fechaInicioDateTime = primerDiaMes.atStartOfDay();
        LocalDateTime fechaFinDateTime = ultimoDiaMes.atTime(LocalTime.MAX);

        predicates.add(cb.greaterThanOrEqualTo(root.get("fechaReg"), fechaInicioDateTime));
        predicates.add(cb.lessThanOrEqualTo(root.get("fechaReg"), fechaFinDateTime));
        log.debug(
            "  + Filtro por fechas (mes actual por defecto): {} - {}",
            fechaInicioDateTime,
            fechaFinDateTime);
      }
    } else if (criteria.getFechaInicio() != null && criteria.getFechaFin() != null) {
      // Si se busca por ID Y se proporcionan fechas, aplicar el filtro de fechas también
      LocalDateTime fechaInicioDateTime = criteria.getFechaInicio().atStartOfDay();
      LocalDateTime fechaFinDateTime = criteria.getFechaFin().atTime(LocalTime.MAX);

      predicates.add(cb.greaterThanOrEqualTo(root.get("fechaReg"), fechaInicioDateTime));
      predicates.add(cb.lessThanOrEqualTo(root.get("fechaReg"), fechaFinDateTime));
      log.debug(
          "  + Filtro por fechas (búsqueda con ID): {} - {}",
          fechaInicioDateTime,
          fechaFinDateTime);
    } else {
      log.debug("  + Filtro por fechas: OMITIDO (búsqueda por ID sin fechas)");
    }

    // Filtro por suplidor
    if (criteria.getSuplidorId() != null) {
      predicates.add(cb.equal(root.get("suplidorId").get("id"), criteria.getSuplidorId()));
      log.debug("  + Filtro por suplidorId: {}", criteria.getSuplidorId());
    }

    // Filtro por id
    if (criteria.getId() != null) {
      predicates.add(cb.equal(root.get("id"), criteria.getId()));
      log.debug("  + Filtro por id: {}", criteria.getId());
    }

    // Filtro por estado
    if (criteria.getEstadoId() != null && !criteria.getEstadoId().isEmpty()) {
      predicates.add(cb.equal(root.get("estadoId"), criteria.getEstadoId()));
      log.debug("  + Filtro por estadoId: {}", criteria.getEstadoId());
    }

    return predicates;
  }
}
