package com.braintech.eFacturador.interfaces.inventario;

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
}
