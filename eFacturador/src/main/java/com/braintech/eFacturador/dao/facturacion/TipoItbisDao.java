package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfSucursalItbis;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoItbisDao extends JpaRepository<MfSucursalItbis, Integer> {
  List<MfSucursalItbis> findByEmpresaId(Integer empresaId);
}
