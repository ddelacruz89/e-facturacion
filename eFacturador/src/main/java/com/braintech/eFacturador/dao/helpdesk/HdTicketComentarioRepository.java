package com.braintech.eFacturador.dao.helpdesk;

import com.braintech.eFacturador.jpa.helpdesk.HdTicketComentario;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HdTicketComentarioRepository extends JpaRepository<HdTicketComentario, Integer> {

  // El cliente nunca ve comentarios internos
  List<HdTicketComentario> findByTicketIdAndEsInternoFalseOrderByFechaRegAsc(Integer ticketId);
}
