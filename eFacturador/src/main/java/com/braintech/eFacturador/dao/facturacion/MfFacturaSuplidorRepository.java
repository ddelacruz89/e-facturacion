package com.braintech.eFacturador.dao.facturacion;

import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MfFacturaSuplidorRepository extends JpaRepository<MfFacturaSuplidor, Integer> {

  Optional<MfFacturaSuplidor> findByEmpresaIdAndSecuencia(Integer empresaId, Integer secuencia);
}
