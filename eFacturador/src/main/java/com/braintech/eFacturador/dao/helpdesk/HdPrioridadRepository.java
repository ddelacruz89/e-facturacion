package com.braintech.eFacturador.dao.helpdesk;

import com.braintech.eFacturador.jpa.helpdesk.HdPrioridad;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HdPrioridadRepository extends JpaRepository<HdPrioridad, String> {

  List<HdPrioridad> findAllByOrderByOrdenAsc();
}
