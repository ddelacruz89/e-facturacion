package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InMovimientoResumenDTO;
import com.braintech.eFacturador.dto.inventario.InMovimientoSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import java.util.List;
import org.springframework.data.domain.Page;

public interface InMovimientoService {

  /** Registra un único movimiento. */
  InMovimiento registrar(InMovimiento movimiento);

  /** Registra varios movimientos en bloque (ej. todos los detalles de una orden de entrada). */
  void registrarTodos(List<InMovimiento> movimientos);

  /** Obtiene un movimiento por id (filtrado por empresa + sucursal del token). */
  InMovimiento findById(Integer id);

  /** Búsqueda paginada con criterios opcionales. */
  Page<InMovimientoResumenDTO> buscar(InMovimientoSearchCriteria criteria);

  /** Historial completo de un producto en un almacén. */
  List<InMovimientoResumenDTO> historialProductoAlmacen(Integer productoId, Integer almacenId);
}
