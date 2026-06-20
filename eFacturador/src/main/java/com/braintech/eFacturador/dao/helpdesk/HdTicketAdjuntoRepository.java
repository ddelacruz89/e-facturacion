package com.braintech.eFacturador.dao.helpdesk;

import com.braintech.eFacturador.jpa.helpdesk.HdTicketAdjunto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HdTicketAdjuntoRepository extends JpaRepository<HdTicketAdjunto, Integer> {

  List<HdTicketAdjunto> findByTicketIdOrderByFechaRegDesc(Integer ticketId);

  List<HdTicketAdjunto> findByComentarioId(Integer comentarioId);
}
