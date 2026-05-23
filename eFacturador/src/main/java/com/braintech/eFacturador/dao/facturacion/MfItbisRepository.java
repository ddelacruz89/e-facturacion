package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfItbis;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MfItbisRepository extends JpaRepository<MfItbis, Integer> {

  List<MfItbis> findByEmpresaId(Integer empresaId);
}
