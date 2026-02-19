package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfRecibos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReciboDao extends JpaRepository<MfRecibos, Integer> {
  @Query("SELECT r FROM MfRecibos r WHERE r.empresaId = :empresaId AND r.id = :reciboId")
  MfRecibos findAllById(Integer empresaId, Integer reciboId);
}
