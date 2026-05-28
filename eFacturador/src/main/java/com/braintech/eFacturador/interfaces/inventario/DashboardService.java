package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.DashboardAjusteBarDTO;
import com.braintech.eFacturador.dto.inventario.DashboardKpiDTO;
import com.braintech.eFacturador.dto.inventario.DashboardSucursalDTO;
import java.util.List;

public interface DashboardService {

  /**
   * Retorna los KPIs del dashboard filtrados por los permisos del usuario. Si {@code sucursalId} es
   * {@code null} se incluyen datos de toda la empresa; de lo contrario solo de esa sucursal.
   */
  List<DashboardKpiDTO> getKpis(Integer sucursalId);

  /**
   * Retorna las sucursales a las que el usuario tiene acceso dentro de su empresa, ordenadas por
   * nombre. Usado para poblar el selector del dashboard.
   */
  List<DashboardSucursalDTO> getSucursales();

  /**
   * Retorna el conteo de ajustes de inventario de los últimos 7 días agrupado por tipo (IDs 4, 5,
   * 9, 20). {@code sucursalId} opcional; {@code null} = toda la empresa.
   */
  List<DashboardAjusteBarDTO> getAjustesPorTipo(Integer sucursalId);
}
