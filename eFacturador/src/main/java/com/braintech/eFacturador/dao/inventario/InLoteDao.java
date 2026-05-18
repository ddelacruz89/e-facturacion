package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InLoteResumenDTO;
import com.braintech.eFacturador.dto.inventario.InLoteSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InLote;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface InLoteDao {
  // InLote extends BaseSucursal - filter by empresaId AND sucursalId

  InLote save(InLote lote);

  Page<InLoteResumenDTO> searchByCriteria(
      InLoteSearchCriteria criteria, Integer empresaId, Integer sucursalId);

  Optional<InLote> findById(String lote, Long productoId, Integer empresaId);

  Optional<InLote> findById(String lote, Long productoId, Integer empresaId, Integer sucursalId);

  List<InLote> findAll(Integer empresaId);

  List<InLote> findAll(Integer empresaId, Integer sucursalId);

  void disableById(String lote, Long productoId, Integer empresaId);

  void disableById(String lote, Long productoId, Integer empresaId, Integer sucursalId);
}
