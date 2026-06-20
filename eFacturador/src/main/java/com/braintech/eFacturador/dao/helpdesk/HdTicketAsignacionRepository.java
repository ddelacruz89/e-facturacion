package com.braintech.eFacturador.dao.helpdesk;

import com.braintech.eFacturador.jpa.helpdesk.HdTicketAsignacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HdTicketAsignacionRepository extends JpaRepository<HdTicketAsignacion, Integer> {

  List<HdTicketAsignacion> findByTicketIdAndActivoTrue(Integer ticketId);
}
