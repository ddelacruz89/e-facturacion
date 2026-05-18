package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InMovimientoTipoResumenDTO;
import com.braintech.eFacturador.dto.inventario.InMovimientoTipoSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InMovimientoTipo;
import java.util.List;

public interface InMovimientoTipoService {

  /** Retorna todos los tipos de movimiento, ordenados por nombre. */
  List<InMovimientoTipo> findAll();

  /**
   * Retorna los tipos filtrados por cr.
   *
   * @param cr {@code true} = crédito (entradas), {@code false} = débito (salidas).
   */
  List<InMovimientoTipo> findByCr(Boolean cr);

  /**
   * Retorna los tipos cuyo campo {@code modulo} contiene el código dado como segmento. Soporta
   * valores compuestos como {@code "AI-OE-OC"}: buscar {@code "OE"} devuelve esa fila.
   *
   * @param modulo código de módulo, ej. {@code "AI"}, {@code "OE"}, {@code "OC"}.
   */
  List<InMovimientoTipo> findByModulo(String modulo);

  /**
   * Búsqueda para el modal: retorna resumen mínimo (id, nombre, cr, modulo). Filtros opcionales: q
   * (nombre parcial) y cr.
   */
  List<InMovimientoTipoResumenDTO> buscar(InMovimientoTipoSearchCriteria criteria);
}
