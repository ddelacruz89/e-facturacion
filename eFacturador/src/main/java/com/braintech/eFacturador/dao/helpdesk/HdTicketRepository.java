package com.braintech.eFacturador.dao.helpdesk;

import com.braintech.eFacturador.jpa.helpdesk.HdTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HdTicketRepository extends JpaRepository<HdTicket, Integer> {

  @Query(
      """
            SELECT t FROM HdTicket t
            WHERE t.empresaId = :empresaId
              AND (:q = '' OR LOWER(t.titulo) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:estadoId IS NULL OR t.estadoId = :estadoId)
            ORDER BY t.fechaReg DESC
            """)
  Page<HdTicket> buscarPorEmpresa(
      @Param("empresaId") Integer empresaId,
      @Param("q") String q,
      @Param("estadoId") String estadoId,
      Pageable pageable);
}
