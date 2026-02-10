package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.jpa.general.MgCliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClienteDao extends JpaRepository<MgCliente, Integer> {
  @Query("SELECT c FROM MgCliente c WHERE c.empresaId = :empresaId")
  Page<MgCliente> findAll(Pageable pageable, Integer empresaId);
}
