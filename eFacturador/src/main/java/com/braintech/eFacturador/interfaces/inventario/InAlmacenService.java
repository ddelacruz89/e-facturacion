package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InAlmacenRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAlmacenResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAlmacenSearchCriteria;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import java.util.List;

public interface InAlmacenService {
  /** Crea un almacén. La sucursal se toma del DTO (frontend); la empresa del TenantContext. */
  InAlmacen create(InAlmacenRequestDTO request);

  /** Actualiza un almacén. La sucursal puede cambiar según el DTO. */
  InAlmacen update(Integer id, InAlmacenRequestDTO request);

  InAlmacen getById(Integer id);

  List<InAlmacen> getAll();

  List<InAlmacen> getAllActive();

  void disable(Integer id);

  /** Activa un almacén (estadoId = 'ACT'). */
  void enable(Integer id);

  /** Búsqueda por empresa (TenantContext) + filtros opcionales (sucursal, nombre, estado). */
  List<InAlmacenResumenDTO> buscar(InAlmacenSearchCriteria criteria);
}
