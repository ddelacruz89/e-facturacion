package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InLoteResumenDTO;
import com.braintech.eFacturador.dto.inventario.InLoteSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InLoteStockResponseDTO;
import com.braintech.eFacturador.dto.inventario.InLoteUpdateDTO;
import com.braintech.eFacturador.jpa.inventario.InLote;
import java.util.List;
import org.springframework.data.domain.Page;

public interface InLoteService {
  InLote save(InLote lote);

  InLote findById(String lote, Long productoId);

  InLote update(String lote, Long productoId, InLoteUpdateDTO dto);

  List<InLote> findAll();

  Page<InLoteResumenDTO> searchByCriteria(InLoteSearchCriteria criteria);

  InLoteStockResponseDTO getStockPorAlmacen(String lote, Long productoId);

  void disableById(String lote, Long productoId);
}
