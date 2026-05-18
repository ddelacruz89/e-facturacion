package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InAjusteInventarioRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockActualDTO;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventario;
import java.util.List;
import org.springframework.data.domain.Page;

public interface InAjusteInventarioService {

  /** Aplica un ajuste de inventario: actualiza InInventario y genera movimientos por cada línea. */
  InAjusteInventario aplicar(InAjusteInventarioRequestDTO request);

  /** Obtiene un ajuste por ID (filtrado por empresa + sucursal del token). */
  InAjusteInventario findById(Integer id);

  /** Lista el historial de ajustes de un almacén específico. */
  List<InAjusteInventarioResumenDTO> findByAlmacen(Integer almacenId);

  /** Búsqueda paginada con filtros: fecha, usuario, estado, motivo. */
  Page<InAjusteInventarioResumenDTO> buscar(InAjusteInventarioSearchCriteria criteria);

  /** Consulta el stock actual de un producto/lote en un almacén. */
  InStockActualDTO getStockActual(Integer productoId, Integer almacenId, String lote);

  /** Lotes con stock > 0 para un producto en un almacén. */
  List<String> getLotesByProductoAndAlmacen(Integer productoId, Integer almacenId);
}
