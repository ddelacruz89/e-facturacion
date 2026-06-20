package com.braintech.eFacturador.dao.helpdesk;

import com.braintech.eFacturador.jpa.helpdesk.HdEstado;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HdEstadoRepository extends JpaRepository<HdEstado, String> {

  List<HdEstado> findAllByOrderByOrdenAsc();
}
