package com.braintech.eFacturador.dao.helpdesk;

import com.braintech.eFacturador.jpa.helpdesk.HdTicketHistorial;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HdTicketHistorialRepository extends JpaRepository<HdTicketHistorial, Integer> {

  List<HdTicketHistorial> findByTicketIdOrderByFechaAsc(Integer ticketId);
}
