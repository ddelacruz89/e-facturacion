package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InMovimientoResumenDTO;
import com.braintech.eFacturador.dto.inventario.InMovimientoSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface InMovimientoDao {

  InMovimiento save(InMovimiento movimiento);

  void saveAll(List<InMovimiento> movimientos);

  Optional<InMovimiento> findById(Integer id, Integer empresaId, Integer sucursalId);

  /** sucursalId en criteria puede ser null → busca en todas las sucursales de la empresa */
  Page<InMovimientoResumenDTO> searchByCriteria(
      InMovimientoSearchCriteria criteria, Integer empresaId);

  List<InMovimientoResumenDTO> findByProductoAndAlmacen(
      Integer productoId, Integer almacenId, Integer empresaId, Integer sucursalId);
}
